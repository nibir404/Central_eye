#!/usr/bin/env python3
"""
Power Grid Bangladesh PLC - Electricity Scraper
Scrapes:
  1. Hourly Demand, Supply, and Loadshedding data
     Source: https://erp.powergrid.gov.bd/web/generations/view_demand_supply_loadshed_bn
  2. Hourly Generation breakdown by fuel source & cross-border imports
     Source: https://erp.powergrid.gov.bd/w/generations/view_generations_bn
"""

import re
import json
import time
import ssl
import sys
import argparse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

# Bengali to English digit translation table
BN_TO_EN = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
}

def to_num(s):
    if not s:
        return 0
    clean = s.translate(BN_TO_EN).replace(",", "").strip()
    try:
        return float(clean) if "." in clean else int(clean)
    except ValueError:
        return 0

def fetch_url(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, context=CTX, timeout=20) as resp:
                if resp.status == 200:
                    return resp.read().decode("utf-8", errors="ignore")
        except Exception as e:
            if attempt == retries - 1:
                print(f"Error fetching {url}: {e}", file=sys.stderr)
                return None
            time.sleep(1.0)
    return None

def parse_demand_supply_page(html):
    tbody_match = re.search(r"<tbody>(.*?)</tbody>", html, re.DOTALL)
    if not tbody_match:
        return []

    rows = []
    tr_matches = re.findall(r"<tr>(.*?)</tr>", tbody_match.group(1), re.DOTALL)
    for tr in tr_matches:
        tr_uncommented = re.sub(r"<!--.*?-->", "", tr, flags=re.DOTALL)
        tds = re.findall(r"<td[^>]*>(.*?)</td>", tr_uncommented, re.DOTALL)
        clean_tds = [re.sub(r"<[^>]+>", "", td).strip() for td in tds]
        if len(clean_tds) >= 5:
            date_str = clean_tds[0].translate(BN_TO_EN)
            time_match = re.search(r"(\d{2}:\d{2}(?::\d{2})?|[০-৯]{2}:[০-৯]{2}(?::[০-৯]{2})?)", tds[1])
            time_str = (time_match.group(1) if time_match else clean_tds[1]).translate(BN_TO_EN)
            demand = to_num(clean_tds[2])
            supply = to_num(clean_tds[3])
            loadshed = to_num(clean_tds[4])
            remark = clean_tds[5] if len(clean_tds) > 5 and clean_tds[5] != "—" else ""
            rows.append({
                "date": date_str,
                "time": time_str,
                "demand_mw": demand,
                "supply_mw": supply,
                "loadshed_mw": loadshed,
                "remark": remark
            })
    return rows

def parse_generation_page(html):
    tbody_match = re.search(r"<tbody>(.*?)</tbody>", html, re.DOTALL)
    if not tbody_match:
        return []

    rows = []
    tr_matches = re.findall(r"<tr>(.*?)</tr>", tbody_match.group(1), re.DOTALL)
    for tr in tr_matches:
        tr_uncommented = re.sub(r"<!--.*?-->", "", tr, flags=re.DOTALL)
        tds = re.findall(r"<td[^>]*>(.*?)</td>", tr_uncommented, re.DOTALL)
        clean_tds = [re.sub(r"<[^>]+>", "", td).strip() for td in tds]
        if len(clean_tds) >= 12:
            date_str = clean_tds[0].translate(BN_TO_EN)
            time_str = clean_tds[1].translate(BN_TO_EN)
            total_gen = to_num(clean_tds[2])
            gas = to_num(clean_tds[3])
            liquid_fuel = to_num(clean_tds[4])
            coal = to_num(clean_tds[5])
            hydro = to_num(clean_tds[6])
            solar = to_num(clean_tds[7])
            wind = to_num(clean_tds[8])
            bheramara = to_num(clean_tds[9])
            tripura = to_num(clean_tds[10])
            adani = to_num(clean_tds[11])
            nepal = to_num(clean_tds[12]) if len(clean_tds) > 12 else 0
            remark = clean_tds[13] if len(clean_tds) > 13 else ""
            rows.append({
                "date": date_str,
                "time": time_str,
                "total_gen_mw": total_gen,
                "gas_mw": gas,
                "liquid_fuel_mw": liquid_fuel,
                "coal_mw": coal,
                "hydro_mw": hydro,
                "solar_mw": solar,
                "wind_mw": wind,
                "india_bheramara_mw": bheramara,
                "india_tripura_mw": tripura,
                "india_adani_mw": adani,
                "nepal_mw": nepal,
                "remark": remark
            })
    return rows

def scrape_all_demand_supply(max_pages=70, workers=8):
    base_url = "https://erp.powergrid.gov.bd/web/generations/view_demand_supply_loadshed_bn?page="
    print(f"Scraping Demand/Supply/Loadshed (up to {max_pages} pages)...")
    results = {}

    def worker(p):
        html = fetch_url(base_url + str(p))
        if not html:
            return p, []
        rows = parse_demand_supply_page(html)
        return p, rows

    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(worker, p): p for p in range(1, max_pages + 1)}
        for future in as_completed(futures):
            p, rows = future.result()
            if rows:
                results[p] = rows
            print(f"\r  Demand/Supply: {len(results)}/{max_pages} pages parsed...", end="", flush=True)

    print()
    all_rows = []
    for p in sorted(results.keys()):
        all_rows.extend(results[p])
    return all_rows

def scrape_all_generation(max_pages=70, workers=8):
    base_url = "https://erp.powergrid.gov.bd/w/generations/view_generations_bn?page="
    print(f"Scraping Generation by Fuel Source (up to {max_pages} pages)...")
    results = {}

    def worker(p):
        html = fetch_url(base_url + str(p))
        if not html:
            return p, []
        rows = parse_generation_page(html)
        return p, rows

    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(worker, p): p for p in range(1, max_pages + 1)}
        for future in as_completed(futures):
            p, rows = future.result()
            if rows:
                results[p] = rows
            print(f"\r  Generation: {len(results)}/{max_pages} pages parsed...", end="", flush=True)

    print()
    all_rows = []
    for p in sorted(results.keys()):
        all_rows.extend(results[p])
    return all_rows

def merge_datasets(demand_list, gen_list):
    gen_map = {}
    for g in gen_list:
        key = (g["date"], g["time"])
        gen_map[key] = g

    merged = []
    seen = set()

    for d in demand_list:
        key = (d["date"], d["time"])
        seen.add(key)
        item = {
            "date": d["date"],
            "time": d["time"],
            "demand_mw": d["demand_mw"],
            "supply_mw": d["supply_mw"],
            "loadshed_mw": d["loadshed_mw"],
            "remark": d["remark"]
        }
        if key in gen_map:
            g = gen_map[key]
            item.update({
                "total_gen_mw": g["total_gen_mw"],
                "gas_mw": g["gas_mw"],
                "liquid_fuel_mw": g["liquid_fuel_mw"],
                "coal_mw": g["coal_mw"],
                "hydro_mw": g["hydro_mw"],
                "solar_mw": g["solar_mw"],
                "wind_mw": g["wind_mw"],
                "cross_border": {
                    "india_bheramara_mw": g["india_bheramara_mw"],
                    "india_tripura_mw": g["india_tripura_mw"],
                    "india_adani_mw": g["india_adani_mw"],
                    "nepal_mw": g["nepal_mw"],
                    "total_imports_mw": g["india_bheramara_mw"] + g["india_tripura_mw"] + g["india_adani_mw"] + g["nepal_mw"]
                }
            })
            if not item["remark"] and g["remark"]:
                item["remark"] = g["remark"]
        merged.append(item)

    # Any extra gen entries not in demand
    for g in gen_list:
        key = (g["date"], g["time"])
        if key not in seen:
            item = {
                "date": g["date"],
                "time": g["time"],
                "demand_mw": 0,
                "supply_mw": g["total_gen_mw"],
                "loadshed_mw": 0,
                "remark": g["remark"],
                "total_gen_mw": g["total_gen_mw"],
                "gas_mw": g["gas_mw"],
                "liquid_fuel_mw": g["liquid_fuel_mw"],
                "coal_mw": g["coal_mw"],
                "hydro_mw": g["hydro_mw"],
                "solar_mw": g["solar_mw"],
                "wind_mw": g["wind_mw"],
                "cross_border": {
                    "india_bheramara_mw": g["india_bheramara_mw"],
                    "india_tripura_mw": g["india_tripura_mw"],
                    "india_adani_mw": g["india_adani_mw"],
                    "nepal_mw": g["nepal_mw"],
                    "total_imports_mw": g["india_bheramara_mw"] + g["india_tripura_mw"] + g["india_adani_mw"] + g["nepal_mw"]
                }
            }
            merged.append(item)

    return merged

def main():
    parser = argparse.ArgumentParser(description="Scrape Power Grid Bangladesh electricity data")
    parser.add_argument("--pages", type=int, default=70, help="Max pages to scrape per link (default: 70)")
    parser.add_argument("--outdir", type=str, default="public/data", help="Output directory")
    args = parser.parse_args()

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    t0 = time.time()
    demand_records = scrape_all_demand_supply(max_pages=args.pages)
    gen_records = scrape_all_generation(max_pages=args.pages)
    unified_records = merge_datasets(demand_records, gen_records)

    # Latest record summary
    latest = unified_records[0] if unified_records else {}
    summary = {
        "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S BST"),
        "total_demand_supply_records": len(demand_records),
        "total_generation_records": len(gen_records),
        "total_unified_records": len(unified_records),
        "latest_entry": latest,
        "date_range": {
            "latest": unified_records[0]["date"] if unified_records else None,
            "earliest": unified_records[-1]["date"] if unified_records else None
        }
    }

    # Save to JSON
    with open(outdir / "powergrid_demand_supply_loadshed.json", "w", encoding="utf-8") as f:
        json.dump(demand_records, f, ensure_ascii=False, indent=2)

    with open(outdir / "powergrid_fuel_generation.json", "w", encoding="utf-8") as f:
        json.dump(gen_records, f, ensure_ascii=False, indent=2)

    with open(outdir / "powergrid_unified.json", "w", encoding="utf-8") as f:
        json.dump(unified_records, f, ensure_ascii=False, indent=2)

    with open(outdir / "powergrid_latest.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"\nScraping complete in {time.time()-t0:.2f}s!")
    print(f"Saved {len(demand_records)} demand/supply/loadshed records to {outdir / 'powergrid_demand_supply_loadshed.json'}")
    print(f"Saved {len(gen_records)} generation fuel records to {outdir / 'powergrid_fuel_generation.json'}")
    print(f"Saved {len(unified_records)} unified records to {outdir / 'powergrid_unified.json'}")
    print(f"Summary saved to {outdir / 'powergrid_latest.json'}")

if __name__ == "__main__":
    main()
