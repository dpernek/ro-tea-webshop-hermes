#!/usr/bin/env python3
"""Download all product images from ro-tea.hr and save locally."""

import json
import os
import time
import urllib.request
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS_JSON = ROOT / "src" / "data" / "products.json"
CATEGORIES_JSON = ROOT / "src" / "data" / "categories.json"
IMAGES_DIR = ROOT / "public" / "images" / "products"

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = "".join(c if c.isalnum() or c in " -" else "" for c in text)
    return "-".join(text.split())[:80]

def download_image(url: str, dest: Path) -> bool:
    if dest.exists():
        return True
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            dest.write_bytes(resp.read())
        return True
    except Exception as e:
        print(f"  FAIL: {url[:80]} -> {e}")
        return False

def main():
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    with open(PRODUCTS_JSON, encoding="utf-8") as f:
        products = json.load(f)

    urls = set()
    for p in products:
        img = p.get("image", "")
        if img and "ro-tea.hr" in img:
            urls.add(img)
        for g in p.get("gallery", []):
            if g and "ro-tea.hr" in g:
                urls.add(g)

    print(f"Found {len(urls)} unique image URLs to download")
    print(f"Saving to: {IMAGES_DIR}\n")

    # Map URL -> local path
    url_map = {}
    for url in urls:
        ext = ".webp"
        if ".png" in url.lower():
            ext = ".png"
        elif ".jpg" in url.lower() or ".jpeg" in url.lower():
            ext = ".jpg"
        # Use the filename from URL
        filename = url.split("/")[-1].split("?")[0]
        if not filename.endswith(ext):
            filename = os.path.splitext(filename)[0] + ext
        url_map[url] = f"/images/products/{filename}"

    # Download in parallel
    tasks = [(url, IMAGES_DIR / Path(local).name) for url, local in url_map.items()]
    done = 0
    failed = 0

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(download_image, url, dest): url for url, dest in tasks}
        for future in as_completed(futures):
            if future.result():
                done += 1
            else:
                failed += 1
            if (done + failed) % 50 == 0:
                print(f"  Progress: {done + failed}/{len(tasks)} ({done} ok, {failed} fail)")

    print(f"\nDownloaded: {done}, Failed: {failed}")

    # Update products.json to use local paths
    updated = 0
    for p in products:
        old_img = p.get("image", "")
        if old_img in url_map:
            p["image"] = url_map[old_img]
            updated += 1
        new_gallery = []
        for g in p.get("gallery", []):
            if g in url_map:
                new_gallery.append(url_map[g])
            else:
                new_gallery.append(g)
        p["gallery"] = new_gallery

    with open(PRODUCTS_JSON, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    # Also update categories.json
    with open(CATEGORIES_JSON, encoding="utf-8") as f:
        categories = json.load(f)
    for c in categories:
        img = c.get("image", "")
        if img in url_map:
            c["image"] = url_map[img]
    with open(CATEGORIES_JSON, "w", encoding="utf-8") as f:
        json.dump(categories, f, ensure_ascii=False, indent=2)

    print(f"Updated {updated} product images to local paths")

if __name__ == "__main__":
    main()
