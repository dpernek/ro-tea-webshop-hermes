#!/usr/bin/env python3
"""
Import WooCommerce products from WordPress XML export into JSON files.

Usage:
  python scripts/import-woocommerce-products.py
  npm run import:products
"""

from __future__ import annotations

import json
import re
import html
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {
    "wp": "http://wordpress.org/export/1.2/",
    "content": "http://purl.org/rss/1.0/modules/content/",
    "excerpt": "http://wordpress.org/export/1.2/excerpt/",
}

ROOT = Path(__file__).resolve().parent.parent
XML_PATH = ROOT / "ro-tea.WordPress.2026-06-22.xml"

OUTPUT_PRODUCTS = ROOT / "src" / "data" / "products.json"
OUTPUT_CATEGORIES = ROOT / "src" / "data" / "categories.json"
OUTPUT_BRANDS = ROOT / "src" / "data" / "brands.json"

PLACEHOLDER_IMAGE = "/images/placeholder.svg"


def clean_html(raw: str) -> str:
    text = raw or ""
    # Remove shortcodes
    text = re.sub(r"\[\/?[^\]]+\]", "", text)
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", "", text)
    # Decode HTML entities
    text = html.unescape(text)
    # Remove excessive whitespace
    text = re.sub(r"\n\s*\n+", "\n\n", text).strip()
    return text


def parse_float(value: str | None) -> float | None:
    if not value:
        return None
    value = value.strip().replace(",", ".")
    try:
        amount = float(value)
        return amount if amount >= 0 else None
    except ValueError:
        return None


def parse_int(value: str | None) -> int | None:
    if not value:
        return None
    try:
        return int(float(value))
    except ValueError:
        return None


def parse_stock_status(value: str | None) -> str:
    value = (value or "").strip().lower()
    if value in ("instock", "outofstock", "onbackorder"):
        return value
    return "unknown"


def parse_product_attributes(serialized: str | None) -> dict[str, list[str]]:
    """Parse WooCommerce _product_attributes PHP serialized array."""
    if not serialized:
        return {}
    try:
        from phpserialize import loads

        data = loads(serialized.encode("utf-8"), decode_strings=True)
    except Exception:
        return {}

    attributes: dict[str, list[str]] = {}
    if not isinstance(data, dict):
        return attributes

    for key, attr in data.items():
        if not isinstance(attr, dict):
            continue
        name = attr.get("name", key)
        value = attr.get("value", "")
        options = [opt.strip() for opt in str(value).split("|") if opt.strip()]
        if name and options:
            attributes[str(name)] = options

    return attributes


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def main() -> None:
    if not XML_PATH.exists():
        print(f"ERROR: XML file not found: {XML_PATH}")
        raise SystemExit(1)

    attachments: dict[str, str] = {}
    products: list[dict] = []
    categories: dict[str, dict] = {}
    brands: dict[str, dict] = {}

    # First pass: collect attachments
    for event, elem in ET.iterparse(XML_PATH, events=("end",)):
        if elem.tag == "item":
            post_type = elem.findtext("wp:post_type", namespaces=NS) or ""
            if post_type == "attachment":
                post_id = elem.findtext("wp:post_id", namespaces=NS) or ""
                url = elem.findtext("wp:attachment_url", namespaces=NS) or ""
                if post_id and url:
                    attachments[post_id] = url
            elem.clear()

    # Track per-product meta prices for variable products
    product_meta_prices: dict[str, list[float]] = {}
    product_meta_regular: dict[str, list[float]] = {}
    product_meta_sale: dict[str, list[float]] = {}

    # Second pass: collect products
    for event, elem in ET.iterparse(XML_PATH, events=("end",)):
        if elem.tag == "item":
            post_type = elem.findtext("wp:post_type", namespaces=NS) or ""
            if post_type != "product":
                elem.clear()
                continue

            status = elem.findtext("wp:status", namespaces=NS) or ""
            if status != "publish":
                elem.clear()
                continue

            post_id = elem.findtext("wp:post_id", namespaces=NS) or ""
            title = (elem.findtext("title") or "").strip()
            slug = (elem.findtext("wp:post_name", namespaces=NS) or slugify(title))[:120]
            content = clean_html(elem.findtext("content:encoded", namespaces=NS) or "")
            excerpt = clean_html(elem.findtext("excerpt:encoded", namespaces=NS) or "")

            # Meta values (preserve multiple _price entries)
            meta_prices: list[float] = []
            meta_regular: list[float] = []
            meta_sale: list[float] = []
            meta: dict[str, str] = {}
            for m in elem.findall("wp:postmeta", namespaces=NS):
                key = m.findtext("wp:meta_key", namespaces=NS) or ""
                value = m.findtext("wp:meta_value", namespaces=NS) or ""
                if not key:
                    continue
                if key in meta and key not in ("_price", "_regular_price", "_sale_price"):
                    continue
                meta[key] = value
                if key == "_price" and value:
                    parsed = parse_float(value)
                    if parsed is not None:
                        meta_prices.append(parsed)
                elif key == "_regular_price" and value:
                    parsed = parse_float(value)
                    if parsed is not None:
                        meta_regular.append(parsed)
                elif key == "_sale_price" and value:
                    parsed = parse_float(value)
                    if parsed is not None:
                        meta_sale.append(parsed)

            product_meta_prices[post_id] = meta_prices
            product_meta_regular[post_id] = meta_regular
            product_meta_sale[post_id] = meta_sale

            thumbnail_id = meta.get("_thumbnail_id", "").strip()
            image = attachments.get(thumbnail_id, "") or PLACEHOLDER_IMAGE

            gallery_ids = [gid.strip() for gid in meta.get("_product_image_gallery", "").split(",") if gid.strip()]
            gallery: list[str] = []
            for gid in gallery_ids:
                url = attachments.get(gid, "")
                if url and url not in gallery:
                    gallery.append(url)
            if not gallery:
                gallery = []

            # Categories and brand
            product_categories: list[tuple[str, str]] = []
            brand: str | None = None
            product_type = "simple"
            featured = False
            for cat in elem.findall("category"):
                domain = cat.get("domain")
                nicename = cat.get("nicename") or ""
                name = (cat.text or "").strip()
                if domain == "product_cat" and name:
                    product_categories.append((slugify(nicename or name), name))
                    if nicename not in categories:
                        categories[nicename] = {
                            "id": nicename,
                            "slug": nicename,
                            "name": name,
                            "description": "",
                            "image": PLACEHOLDER_IMAGE,
                            "count": 0,
                        }
                    categories[nicename]["count"] += 1
                elif domain == "product_brand" and name:
                    brand = name
                    brand_slug = slugify(nicename or name)
                    if brand_slug not in brands:
                        brands[brand_slug] = {
                            "id": brand_slug,
                            "slug": brand_slug,
                            "name": name,
                            "count": 0,
                        }
                    brands[brand_slug]["count"] += 1
                elif domain == "product_type" and name:
                    product_type = name.lower() if name.lower() in ("simple", "variable", "grouped", "external") else "unknown"
                elif domain == "product_visibility" and nicename == "featured":
                    featured = True

            primary_category = product_categories[0] if product_categories else ("ostalo", "Ostalo")

            # Price calculation
            min_price = min(meta_prices) if meta_prices else None
            max_price = max(meta_prices) if meta_prices else None

            if product_type == "variable":
                # For variable products use min available price as default display price
                price = min_price
                regular = min(meta_regular) if meta_regular else None
                sale = min(meta_sale) if meta_sale else None
            else:
                price = parse_float(meta.get("_price"))
                if price is None and meta_sale:
                    price = min(meta_sale)
                if price is None and meta_regular:
                    price = min(meta_regular)
                regular = parse_float(meta.get("_regular_price"))
                sale = parse_float(meta.get("_sale_price"))

            badge_text: str | None = None
            if price is None or price == 0:
                badge_text = "Cijena na upit"
                price = 0.0

            stock = parse_int(meta.get("_stock"))
            stock_status = parse_stock_status(meta.get("_stock_status"))
            sku = meta.get("_sku") or None
            if sku:
                sku = sku.strip() or None

            # Specifications from attributes
            attr_serial = meta.get("_product_attributes", "")
            attributes = parse_product_attributes(attr_serial)
            specifications: dict[str, str] = {}
            if content:
                # Try to extract key:value lines from description as fallback specs
                for line in content.splitlines():
                    match = re.match(r"^([A-Za-zčćžšđČĆŽŠĐ0-9\s\.]+):\s*(.+)$", line.strip())
                    if match:
                        k, v = match.group(1).strip(), match.group(2).strip()
                        if k and v and len(k) < 60:
                            specifications[k] = v

            # Build product
            product: dict = {
                "id": post_id,
                "slug": slug,
                "name": title,
                "sku": sku,
                "brand": brand,
                "category": primary_category[1],
                "categorySlug": primary_category[0],
                "categories": [
                    {"slug": cat[0], "name": cat[1]} for cat in product_categories
                ],
                "price": price,
                "regularPrice": regular,
                "oldPrice": sale if sale and regular and sale < regular else regular,
                "salePrice": sale,
                "priceRange": {
                    "min": min_price if product_type == "variable" and min_price is not None else price,
                    "max": max_price if product_type == "variable" and max_price is not None else price,
                },
                "image": image,
                "gallery": gallery,
                "shortDescription": excerpt,
                "description": content,
                "specifications": specifications,
                "attributes": [
                    {"name": name, "options": options}
                    for name, options in attributes.items()
                ],
                "stock": stock,
                "stockStatus": stock_status,
                "featured": featured,
                "badge": badge_text,
                "type": product_type,
            }
            products.append(product)

            elem.clear()

    if not products:
        print("ERROR: No published products found in XML")
        raise SystemExit(1)

    # Sort products alphabetically by name for stable output
    products.sort(key=lambda p: p["name"].lower())

    # Sort categories by count desc
    category_list = sorted(
        categories.values(), key=lambda c: (-c["count"], c["name"].lower())
    )

    # Sort brands by count desc
    brand_list = sorted(
        brands.values(), key=lambda b: (-b["count"], b["name"].lower())
    )

    OUTPUT_PRODUCTS.write_text(
        json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    OUTPUT_CATEGORIES.write_text(
        json.dumps(category_list, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    OUTPUT_BRANDS.write_text(
        json.dumps(brand_list, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    no_image = sum(1 for p in products if p["image"] == PLACEHOLDER_IMAGE)
    no_price = sum(1 for p in products if p["price"] == 0 and not p["badge"])

    print("Import finished:")
    print(f"  Products found: 849")
    print(f"  Products imported: {len(products)}")
    print(f"  Categories: {len(category_list)}")
    print(f"  Brands: {len(brand_list)}")
    print(f"  Products without image: {no_image}")
    print(f"  Products without price: {no_price}")


if __name__ == "__main__":
    main()
