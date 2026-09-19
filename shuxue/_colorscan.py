# -*- coding: utf-8 -*-
import os, json
from playwright.sync_api import sync_playwright

D = r"C:\Users\86139\Documents\ChatGPT\小二算数"
URL = "file:///" + os.path.join(D, "index-standalone.html").replace("\\", "/")

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width": 1280, "height": 900})
    pg.goto(URL, wait_until="domcontentloaded", timeout=30000)
    pg.wait_for_timeout(2500)

    print("=== 扫描所有可见文字元素的实际颜色 ===")
    res = pg.evaluate("""() => {
      const bad = [];
      const all = document.querySelectorAll('h1,h2,h3,h4,p,span,div,button,a,li,label,strong,b');
      all.forEach(el => {
        const txt = (el.innerText||"").trim();
        if(!txt || txt.length > 60) return;
        // 只看直接包含文本的叶子节点
        const hasChildText = Array.from(el.children).some(c => (c.innerText||"").trim().length > 0);
        if(hasChildText) return;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        if(r.width < 1 || r.height < 1) return;
        const color = cs.color;
        const m = color.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
        if(!m) return;
        const a = m[4] === undefined ? 1 : parseFloat(m[4]);
        const lum = 0.2126*parseInt(m[1]) + 0.7152*parseInt(m[2]) + 0.0722*parseInt(m[3]);
        // 判定问题：透明(a<0.5) 或 深色字(lum<90)
        if(a < 0.5 || lum < 90){
          bad.push({tag: el.tagName, cls: (el.className||"").toString().slice(0,40),
            txt: txt.slice(0,24), color: color, alpha: a, lum: Math.round(lum),
            fs: cs.fontSize, bg: cs.backgroundColor});
        }
      });
      return bad;
    }""")
    print("  问题元素数:", len(res))
    for x in res[:30]:
        print("   ", json.dumps(x, ensure_ascii=False))

    print("\n=== h1/h2/h3 详细 ===")
    hs = pg.evaluate("""() => {
      const out = [];
      document.querySelectorAll('h1,h2,h3,.title,.subtitle,.grade-title').forEach(el => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        out.push({tag: el.tagName, cls: (el.className||"").toString().slice(0,40),
          txt: (el.innerText||"").trim().slice(0,30), color: cs.color,
          bg: cs.backgroundColor, fs: cs.fontSize, w: Math.round(r.width), h: Math.round(r.height)});
      });
      return out;
    }""")
    for x in hs: print("   ", json.dumps(x, ensure_ascii=False))

    print("\n=== 主要容器背景色 ===")
    bgs = pg.evaluate("""() => {
      const out = {};
      ["body","html","#app",".app",".container",".home",".main"].forEach(s => {
        const el = document.querySelector(s);
        if(el){ const cs = getComputedStyle(el);
          out[s] = {bg: cs.backgroundColor, bgImg: cs.backgroundImage.slice(0,60), color: cs.color}; }
      });
      return out;
    }""")
    for k,v in bgs.items(): print("   ", k, json.dumps(v, ensure_ascii=False))

    b.close()
