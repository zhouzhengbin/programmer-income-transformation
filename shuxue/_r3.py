# -*- coding: utf-8 -*-
import os, io, json
from playwright.sync_api import sync_playwright

D = r"C:\Users\86139\Documents\ChatGPT\小二算数"
URL = "file:///" + os.path.join(D, "index-standalone.html").replace("\\", "/")
rep = {"log": [], "errs": []}
def L(m):
    print(m, flush=True); rep["log"].append(m)

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width":1280,"height":900})
    pg.on("pageerror", lambda e: rep["errs"].append(str(e)))
    pg.goto(URL, wait_until="domcontentloaded", timeout=30000)
    pg.wait_for_timeout(2000)

    L("=== 进第一课 ===")
    pg.evaluate("""() => {
      const cards = Array.from(document.querySelectorAll(".lesson-card,.card,[data-idx]"));
      const vis = cards.filter(c => c.getBoundingClientRect().width>20);
      if(vis.length) vis[0].click();
    }""")
    pg.wait_for_timeout(1200)

    L("=== 点开始 ===")
    pg.evaluate("""() => { const b=document.querySelector("#btnPlay"); if(b) b.click(); }""")
    pg.wait_for_timeout(2500)

    L("=== 探测题目容器 ===")
    r = pg.evaluate("""() => {
      const out = {candidates:{}};
      ["#stepText",".step-text","#stage",".stage","#lessonTitle",".anim-stage","#anim","#board",".board",".scene"].forEach(s=>{
        const e=document.querySelector(s);
        if(e){ const r=e.getBoundingClientRect();
          out.candidates[s]={txt:(e.innerText||e.textContent||"").trim().slice(0,50), w:Math.round(r.width), h:Math.round(r.height)}; }
      });
      const nums=[];
      document.querySelectorAll("div,span,p,h2,h3").forEach(e=>{
        const t=(e.innerText||"").trim();
        const r=e.getBoundingClientRect();
        if(r.width>0 && r.height>0 && /[0-9]/.test(t) && t.length<40 && !Array.from(e.children).some(c=>(c.innerText||"").trim().length>0))
          nums.push(t);
      });
      out.numberTexts = nums.slice(0,20);
      return out;
    }""")
    L(json.dumps(r, ensure_ascii=False, indent=1))

    L("")
    L("=== 连点换一题 8 次，抓可见数字文本指纹 ===")
    r2 = pg.evaluate("""() => {
      const btn = document.querySelector("#btnNew");
      if(!btn) return {found:false};
      const grab = () => {
        const arr=[];
        document.querySelectorAll("div,span,p,h2,h3").forEach(e=>{
          const t=(e.innerText||"").trim();
          const r=e.getBoundingClientRect();
          if(r.width>0 && r.height>0 && /[0-9]/.test(t) && t.length<40 && !Array.from(e.children).some(c=>(c.innerText||"").trim().length>0))
            arr.push(t);
        });
        return arr.slice(0,8).join("|");
      };
      const seq=[grab()];
      for(let i=0;i<8;i++){ btn.click(); seq.push(grab()); }
      return {found:true, seq:seq};
    }""")
    if r2.get("found"):
        for i,s in enumerate(r2["seq"]): L("  [%d] %s" % (i,s[:100]))
        u = len(set(r2["seq"]))
        L("  唯一指纹数: %d / %d" % (u, len(r2["seq"])))

    pg.screenshot(path=os.path.join(D,"_shot2.png"), full_page=True)
    L("")
    L("截图: _shot2.png")
    b.close()

L("错误: %d" % len(rep["errs"]))
for e in rep["errs"][:8]: L("  "+e[:150])
io.open(os.path.join(D,"_r3.json"),"w",encoding="utf-8").write(json.dumps(rep,ensure_ascii=False,indent=2))
