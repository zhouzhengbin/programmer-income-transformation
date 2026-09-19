# -*- coding: utf-8 -*-
import os, io, json, time
from playwright.sync_api import sync_playwright

D = r"C:\Users\86139\Documents\ChatGPT\小二算数"
HTML = os.path.join(D, "index-standalone.html")
URL = "file:///" + HTML.replace("\\", "/")

report = {"console_errors": [], "page_errors": [], "checks": []}

def log(msg):
    print(msg, flush=True)
    report["checks"].append(msg)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.on("console", lambda m: report["console_errors"].append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: report["page_errors"].append(str(e)))

    log("=== 1. 加载页面 ===")
    page.goto(URL, wait_until="domcontentloaded", timeout=30000)
    page.wait_for_timeout(2500)
    log("  title: " + page.title())

    log("\n=== 2. 全局对象检查 ===")
    has_app = page.evaluate("!!window.__APP__")
    log("  window.__APP__: " + str(has_app))
    catalog_len = page.evaluate("window.__APP__ ? Object.keys(window.__APP__.CATALOG||{}).length : -1")
    log("  CATALOG keys: " + str(catalog_len))
    cat = page.evaluate("window.__APP__ && window.__APP__.CATALOG ? JSON.stringify(Object.keys(window.__APP__.CATALOG)) : '[]'")
    log("  CATALOG: " + cat)

    log("\n=== 3. 首页元素尺寸测量 ===")
    dims = page.evaluate("""() => {
      const out = {};
      const h1 = document.querySelector('h1');
      if(h1){ const r = h1.getBoundingClientRect(); const cs = getComputedStyle(h1);
        out.h1 = {w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, color: cs.color, text: h1.innerText.slice(0,30)}; }
      const btns = document.querySelectorAll('button, .btn, [data-grade], [data-lesson]');
      out.btnCount = btns.length;
      if(btns.length){ const r = btns[0].getBoundingClientRect(); const cs = getComputedStyle(btns[0]);
        out.firstBtn = {w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, text: btns[0].innerText.slice(0,20)}; }
      out.bodyScrollW = document.body.scrollWidth;
      out.winW = window.innerWidth;
      out.overflowX = document.body.scrollWidth > window.innerWidth + 2;
      return out;
    }""")
    log("  " + json.dumps(dims, ensure_ascii=False))

    browser.close()

log("\n=== 4. 错误汇总 ===")
log("  console errors: " + str(len(report["console_errors"])))
for e in report["console_errors"][:10]: log("    - " + e[:150])
log("  page errors: " + str(len(report["page_errors"])))
for e in report["page_errors"][:10]: log("    - " + e[:150])

with io.open(os.path.join(D, "_e2e_report.json"), "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=2)
log("\n报告已保存 _e2e_report.json")
