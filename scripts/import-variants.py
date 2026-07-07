#!/usr/bin/env python3
"""
Import WooCommerce variations from CSV into ProductVariant table.
Reads wc-product-export CSV and products.json to map WC IDs → slugs,
then creates variants via admin API.
"""
import csv
import json
import urllib.request
import urllib.error
import sys
import http.cookiejar
import re

CSV_PATH = "/Users/macbookair/Downloads/wc-product-export-7-7-2026-1783418068402.csv"
JSON_PATH = "/Users/macbookair/Projects/GitHub/ro-tea-webshop-hermes/src/data/products.json"
BASE_URL = "https://ro-tea-webshop-hermes.vercel.app"
ADMIN_EMAIL = "davor.pernek@ro-tea.hr"
ADMIN_PASS = "Rotea2006"

def auth():
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    # Get CSRF
    resp = opener.open(urllib.request.Request(f"{BASE_URL}/api/auth/csrf"))
    csrf = json.loads(resp.read())["csrfToken"]
    # Login
    data = f"email={ADMIN_EMAIL}&password={ADMIN_PASS}&csrfToken={csrf}".encode()
    req = urllib.request.Request(f"{BASE_URL}/api/auth/callback/credentials", data=data)
    resp = opener.open(req)
    return opener

def main():
    # Load products.json to map slug by old ID (if stored) or by matching
    with open(JSON_PATH) as f:
        products = json.load(f)
    
    # Build slug → slug (we'll use slug lookup)
    slug_set = {p["slug"] for p in products}
    
    # Read CSV variations
    variations: dict[str, list[dict]] = {}
    with open(CSV_PATH, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            t = row.get("Vrsta", "")
            parent = row.get("Matični", "")
            if t != "variation" or not parent or not parent.startswith("id:"):
                continue
            parent_id = parent[3:]
            
            attrs = {}
            for i in range(1, 5):
                name = (row.get(f"Atribut {i} ime") or "").strip()
                val = (row.get(f"Atribut {i} vrijednosti") or "").strip()
                if name and val:
                    attrs[name] = val
            if not attrs:
                continue
            
            price_str = (row.get("Normalna cijena") or "0").replace(",", ".").strip('"')
            try:
                price = float(price_str)
            except ValueError:
                continue
            sku = (row.get("SKU") or "").strip()
            
            if parent_id not in variations:
                variations[parent_id] = []
            variations[parent_id].append({"attributes": attrs, "price": price, "sku": sku})
    
    # Map WC IDs to product slugs via products.json
    # The products.json stores WC IDs in different ways. Let's use a name-based match.
    # First, read the CSV again to get parent product names
    parent_names: dict[str, str] = {}
    with open(CSV_PATH, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            t = row.get("Vrsta", "")
            pid = row.get("ID", "")
            if t == "variable":
                name = row.get("Naziv", "")
                parent_names[pid] = name
    
    # Map parent_id → slug by matching product names
    id_to_slug: dict[str, str] = {}
    for pid, name in parent_names.items():
        # Find matching product in products.json
        for p in products:
            if p.get("wc_id") == pid:
                id_to_slug[pid] = p["slug"]
                break
        if pid not in id_to_slug:
            # Try name match
            import difflib
            best = None
            best_score = 0
            for p in products:
                score = difflib.SequenceMatcher(None, name.lower(), p["name"].lower()).ratio()
                if score > best_score:
                    best_score = score
                    best = p["slug"]
            if best_score > 0.6:
                id_to_slug[pid] = best
    
    print(f"Mapped {len(id_to_slug)}/{len(parent_names)} parent IDs to slugs")
    
    # Authenticate
    print("Authenticating...")
    opener = auth()
    
    created = 0
    skipped = 0
    errors = 0
    
    for parent_id, var_list in variations.items():
        slug = id_to_slug.get(parent_id)
        if not slug:
            skipped += len(var_list)
            continue
        
        for var in var_list:
            body = json.dumps({
                "sku": var["sku"],
                "price": var["price"],
                "attributes": var["attributes"]
            }).encode()
            req = urllib.request.Request(
                f"{BASE_URL}/api/admin/products/{slug}/variants",
                data=body,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            try:
                resp = opener.open(req)
                created += 1
            except urllib.error.HTTPError as e:
                print(f"  ERROR {slug}: {e.code} — {e.read().decode()[:100]}")
                errors += 1
    
    print(f"\nDone: {created} created, {skipped} skipped (no slug match), {errors} errors")

if __name__ == "__main__":
    main()
