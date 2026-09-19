# -*- coding: utf-8 -*-
import os, sys, json, time, io, zipfile
import requests

D = r"C:\Users\86139\Documents\ChatGPT\小二算数"
DEPLOY = os.path.join(D, "_deploy")
PROXIES = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}

print("=== 1. 打包 _deploy -> zip ===")
zip_path = os.path.join(D, "_netlify_drop.zip")
if os.path.exists(zip_path): os.remove(zip_path)
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(DEPLOY):
        for f in files:
            full = os.path.join(root, f)
            arc = os.path.relpath(full, DEPLOY)
            z.write(full, arc)
print("  zip bytes:", os.path.getsize(zip_path))

print("\n=== 2. 匿名建站 POST /api/v1/sites ===")
try:
    r = requests.post("https://api.netlify.com/api/v1/sites",
                      json={}, proxies=PROXIES, timeout=60,
                      headers={"User-Agent": "Mozilla/5.0"})
    print("  HTTP", r.status_code)
    print("  body[:300]:", r.text[:300])
    if r.status_code in (200, 201):
        site = r.json()
        site_id = site["id"]
        print("  site_id:", site_id)
        print("  subdomain:", site.get("subdomain"))
        print("  ssl_url:", site.get("ssl_url"))
        with io.open(os.path.join(D, "_netlify_site.json"), "w", encoding="utf-8") as f:
            json.dump(site, f, ensure_ascii=False, indent=2)
        print("\n=== 3. 上传 zip POST /api/v1/sites/{id}/deploys ===")
        with open(zip_path, "rb") as f:
            up = requests.post(
                "https://api.netlify.com/api/v1/sites/%s/deploys" % site_id,
                data=f, proxies=PROXIES, timeout=180,
                headers={"Content-Type": "application/zip", "User-Agent": "Mozilla/5.0"})
        print("  HTTP", up.status_code)
        print("  body[:400]:", up.text[:400])
        if up.status_code in (200, 201):
            dep = up.json()
            print("  deploy_id:", dep.get("id"))
            print("  state:", dep.get("state"))
            print("  deploy_url:", dep.get("ssl_url") or dep.get("url"))
            with io.open(os.path.join(D, "_netlify_deploy.json"), "w", encoding="utf-8") as f:
                json.dump(dep, f, ensure_ascii=False, indent=2)
    else:
        print("  BUILD SITE FAILED")
except Exception as e:
    print("  EXCEPTION:", type(e).__name__, str(e)[:300])
