#!/usr/bin/env python3
"""
Import WooCommerce products from WordPress XML export into JSON files.

Usage:
  python scripts/import-woocommerce-products.py
  npm run import:products
"""

import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

# Optional PHP serializer for product attributes
PHPSERIALIZE_AVAILABLE = False
try:
    import phpserialize

    PHPSERIALIZE_AVAILABLE = True
except ImportError:
    pass

# Paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
XML_PATH = PROJECT_ROOT / "ro-tea.WordPress.2026-06-22.xml"
DATA_DIR = PROJECT_ROOT / "src" / "data"

# Namespaces used by WordPress eXtended RSS (WXR)
NS_WP = "{http://wordpress.org/export/1.2/}"
NS_CONTENT = "{http://purl.org/rss/1.0/modules/content/}"
NS_EXCERPT = "{http://wordpress.org/export/1.2/excerpt/}"

# RSS core elements (no prefix in this export) use plain local names
TAG_ITEM = "item"
TAG_TITLE = "title"
TAG_LINK = "link"
TAG_CATEGORY = "category"

PLACEHOLDER_IMAGE = "/images/placeholder.svg"


def clean_text(text: str) -> str:
    """Trim whitespace from text nodes."""
    if text is None:
        return ""
    return text.strip()


def parse_price(value: str) -> float:
    """Convert WooCommerce price string to float, handling comma decimals."""
    if not value:
        return 0.0
    normalized = value.replace(",", ".").replace(" ", "").replace("\u00a0", "")
    try:
        return float(normalized)
    except ValueError:
        return 0.0


def html_to_text(html: str) -> str:
    """Convert basic HTML to plain text while keeping paragraphs."""
    if not html:
        return ""
    # Remove script/style tags and their content
    text = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)
    # Replace common block tags with newlines
    text = re.sub(r"</(p|div|h[1-6]|li)>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.IGNORECASE)
    # Strip remaining tags
    text = re.sub(r"<[^>]+>", "", text)
    # Decode common entities
    text = text.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    # Normalize whitespace
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n\n".join(lines)


def slugify(value: str) -> str:
    """Create a URL-friendly slug from any string."""
    slug = value.lower()
    slug = slug.replace(" ", "-")
    slug = re.sub(r"[^a-z0-9ćčđšž-]", "", slug)
    return slug or "nepoznato"


def parse_product_attributes(meta_value: str) -> dict:
    """Extract attribute name/value pairs from WooCommerce serialized attributes."""
    specs = {}
    if not meta_value:
        return specs

    if PHPSERIALIZE_AVAILABLE:
        try:
            data = phpserialize.loads(meta_value.encode("utf-8"), decode_strings=True)
            if isinstance(data, dict):
                for key, attr in data.items():
                    if (
                        isinstance(attr, dict)
                        and attr.get("is_visible")
                        and attr.get("value")
                    ):
                        name = attr.get("name", key)
                        value = attr.get("value", "")
                        if isinstance(value, bytes):
                            value = value.decode("utf-8")
                        if value and str(value).strip():
                            specs[str(name)] = str(value).strip()
        except Exception:
            pass

    # Fallback regex extraction if phpserialize fails
    if not specs:
        matches = re.findall(
            r's:4:"name";s:\d+:"([^"]+)";s:5:"value";s:\d+:"([^"]+)"',
            meta_value,
        )
        for name, value in matches:
            if value.strip():
                specs[name] = value.strip()

    return specs


def iter_items(xml_path: Path):
    """Yield parsed <item> elements one at a time to keep memory low."""
    context = ET.iterparse(xml_path, events=("start", "end"))
    context = iter(context)
    event, root = next(context)

    for event, elem in context:
        if event == "end" and elem.tag == TAG_ITEM:
            yield elem
            elem.clear()
            root.clear()


def collect_attachments(xml_path: Path) -> dict:
    """First pass: build a map of attachment post_id -> attachment_url."""
    attachments = {}
    for item in iter_items(xml_path):
        post_type_elem = item.find(f"{NS_WP}post_type")
        post_type = clean_text(post_type_elem.text) if post_type_elem is not None else ""

        if post_type != "attachment":
            continue

        post_id_elem = item.find(f"{NS_WP}post_id")
        attachment_url_elem = item.find(f"{NS_WP}attachment_url")
        post_id = int(clean_text(post_id_elem.text)) if post_id_elem is not None else None
        attachment_url = (
            clean_text(attachment_url_elem.text) if attachment_url_elem is not None else ""
        )
        if post_id and attachment_url:
            attachments[post_id] = attachment_url

    return attachments


def main():
    if not XML_PATH.exists():
        print(f"ERROR: XML file not found at {XML_PATH}", file=sys.stderr)
        print(
            "Copy the WordPress export file to the project root and name it: ro-tea.WordPress.2026-06-22.xml",
            file=sys.stderr,
        )
        sys.exit(1)

    # ------------------------------------------------------------------
    # Pass 1: collect all attachments so product image lookups work.
    # ------------------------------------------------------------------
    print("Pass 1: Učitavam attachmente...")
    attachments = collect_attachments(XML_PATH)
    print(f"Pronađeno {len(attachments)} attachmenta.\n")

    # ------------------------------------------------------------------
    # Pass 2: parse products.
    # ------------------------------------------------------------------
    print("Pass 2: Učitavam proizvode...")
    products = []
    category_counts = Counter()
    brand_counts = Counter()
    products_without_image = 0
    products_without_price = 0
    total_products = 0
    published_products = 0

    for item in iter_items(XML_PATH):
        post_type_elem = item.find(f"{NS_WP}post_type")
        post_type = clean_text(post_type_elem.text) if post_type_elem is not None else ""

        if post_type != "product":
            continue

        total_products += 1
        status_elem = item.find(f"{NS_WP}status")
        status = clean_text(status_elem.text) if status_elem is not None else ""

        if status != "publish":
            continue

        published_products += 1

        post_id_elem = item.find(f"{NS_WP}post_id")
        post_id = clean_text(post_id_elem.text) if post_id_elem is not None else ""

        title_elem = item.find(TAG_TITLE)
        name = clean_text(title_elem.text) if title_elem is not None else ""

        post_name_elem = item.find(f"{NS_WP}post_name")
        slug = clean_text(post_name_elem.text) if post_name_elem is not None else ""

        content_elem = item.find(f"{NS_CONTENT}encoded")
        description_html = clean_text(content_elem.text) if content_elem is not None else ""
        description = html_to_text(description_html)
        if not description:
            description = "Detalji proizvoda trenutno nisu dostupni. Kontaktirajte nas za više informacija."

        excerpt_elem = item.find(f"{NS_EXCERPT}encoded")
        short_description = html_to_text(
            clean_text(excerpt_elem.text) if excerpt_elem is not None else ""
        )

        # Categories and brand
        categories = []
        brand = None
        product_type = "simple"
        featured = False

        for category in item.findall(TAG_CATEGORY):
            domain = category.get("domain", "")
            nicename = category.get("nicename", "")
            cat_name = clean_text(category.text)

            if domain == "product_cat" and cat_name:
                cat_slug = nicename or slugify(cat_name)
                categories.append({"name": cat_name, "slug": cat_slug})
                category_counts[cat_name] += 1
            elif domain == "product_brand" and cat_name:
                brand = cat_name
                brand_counts[cat_name] += 1
            elif domain == "product_type" and cat_name:
                product_type = cat_name
            elif domain == "product_visibility" and nicename == "featured":
                featured = True

        primary_category = (
            categories[0] if categories else {"name": "Ostalo", "slug": "ostalo"}
        )

        # Meta values (take last occurrence if duplicate keys exist)
        meta = {}
        for postmeta in item.findall(f"{NS_WP}postmeta"):
            key_elem = postmeta.find(f"{NS_WP}meta_key")
            value_elem = postmeta.find(f"{NS_WP}meta_value")
            key = clean_text(key_elem.text) if key_elem is not None else ""
            value = clean_text(value_elem.text) if value_elem is not None else ""
            if key:
                meta[key] = value

        sku = meta.get("_sku") or None
        regular_price = parse_price(meta.get("_regular_price", ""))
        sale_price = parse_price(meta.get("_sale_price", ""))
        price_value = parse_price(meta.get("_price", ""))

        # Determine final price and old price
        if sale_price > 0:
            final_price = sale_price
            old_price = regular_price if regular_price > sale_price else 0.0
        elif price_value > 0:
            final_price = price_value
            old_price = regular_price if regular_price > price_value else 0.0
        elif regular_price > 0:
            final_price = regular_price
            old_price = 0.0
        else:
            final_price = 0.0
            old_price = 0.0
            products_without_price += 1

        # Stock
        stock_status = meta.get("_stock_status") or "unknown"
        stock_raw = meta.get("_stock", "")
        try:
            stock_qty = int(float(stock_raw)) if stock_raw else None
        except ValueError:
            stock_qty = None

        # Image mapping
        thumbnail_id = meta.get("_thumbnail_id", "")
        image_url = PLACEHOLDER_IMAGE
        if thumbnail_id:
            try:
                image_url = attachments.get(int(thumbnail_id), PLACEHOLDER_IMAGE)
            except ValueError:
                image_url = PLACEHOLDER_IMAGE
        if image_url == PLACEHOLDER_IMAGE:
            products_without_image += 1

        # Gallery mapping
        gallery_ids_str = meta.get("_product_image_gallery", "")
        gallery = []
        if gallery_ids_str:
            for gid in gallery_ids_str.split(","):
                gid = gid.strip()
                if not gid:
                    continue
                try:
                    gallery_url = attachments.get(int(gid))
                    if gallery_url and gallery_url not in gallery:
                        gallery.append(gallery_url)
                except ValueError:
                    continue

        if not gallery:
            gallery = [image_url]

        # Specifications
        specifications = parse_product_attributes(meta.get("_product_attributes", ""))

        # Badge
        badge = None
        if product_type == "variable":
            badge = "Više opcija"
        elif final_price == 0:
            badge = "Cijena na upit"
        elif old_price > 0 and final_price > 0:
            badge = "Akcija"
        elif featured:
            badge = "Istaknuto"

        product = {
            "id": post_id or slug,
            "slug": slug,
            "name": name,
            "sku": sku,
            "brand": brand,
            "category": primary_category["name"],
            "categorySlug": primary_category["slug"],
            "categories": [c["name"] for c in categories],
            "price": final_price,
            "regularPrice": regular_price if regular_price > 0 else None,
            "oldPrice": old_price if old_price > 0 else None,
            "salePrice": sale_price if sale_price > 0 else None,
            "image": image_url,
            "gallery": gallery,
            "shortDescription": short_description,
            "description": description,
            "specifications": specifications,
            "stock": stock_qty,
            "stockStatus": stock_status,
            "featured": featured,
            "badge": badge,
            "type": product_type,
        }
        products.append(product)

    # Generate categories.json
    categories_json = []
    for name, count in category_counts.most_common():
        slug = slugify(name)
        categories_json.append(
            {
                "id": slug,
                "slug": slug,
                "name": name,
                "description": "",
                "image": "/images/placeholder.svg",
                "productCount": count,
            }
        )

    # Generate brands.json
    brands_json = []
    for name, count in brand_counts.most_common():
        slug = slugify(name)
        brands_json.append(
            {
                "id": slug,
                "slug": slug,
                "name": name,
                "count": count,
            }
        )

    # Write files
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    products_path = DATA_DIR / "products.json"
    categories_path = DATA_DIR / "categories.json"
    brands_path = DATA_DIR / "brands.json"

    with open(products_path, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    with open(categories_path, "w", encoding="utf-8") as f:
        json.dump(categories_json, f, ensure_ascii=False, indent=2)

    with open(brands_path, "w", encoding="utf-8") as f:
        json.dump(brands_json, f, ensure_ascii=False, indent=2)

    # Statistics
    print("\n=== Import statistika ===")
    print(f"Ukupno product zapisa u XML-u: {total_products}")
    print(f"Objavljenih (publish) proizvoda: {published_products}")
    print(f"Importanih proizvoda u JSON:     {len(products)}")
    print(f"Generiranih kategorija:          {len(categories_json)}")
    print(f"Generiranih brendova:            {len(brands_json)}")
    print(f"Proizvoda bez slike:             {products_without_image}")
    print(f"Proizvoda bez cijene:            {products_without_price}")
    print(f"\nGenerirane datoteke:")
    print(f"  - {products_path}")
    print(f"  - {categories_path}")
    print(f"  - {brands_path}")


if __name__ == "__main__":
    main()
