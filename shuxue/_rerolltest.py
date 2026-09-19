# -*- coding: utf-8 -*-
import os, io, json
from playwright.sync_api import sync_playwright

D = r"C:\Users\86139\Documents\ChatGPT\小二算数"
URL = "file:///" + os.path.join(D, "index-standalone.html").replace("\\", "/")
rep = {"errs": [], "log": []}
def L(m):
    print(m, flush=True); rep["log"].append(m)

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width":1280,"height":900})
    pg.on("pageerror", lambda e: rep["errs"].append("PAGEERR: "+str(e)))
    pg.on("console", lambda m: rep["errs"].append("CONSOLE: "+m.text) if m.type=="error" else None)
    pg.goto(URL, wait_until="domcontentloaded", timeout=30000)
    pg.wait_for_timeout(2500)

    L("=== 1. __swapLesson 是否存在 ===")
    L("  " + str(pg.evaluate("typeof window.__swapLesson")))

    L("\n=== 2. 进入第一课（点课程卡） ===")
    r = pg.evaluate("""() => {
      const cards = Array.from(document.querySelectorAll(".lesson-card,.card,[data-idx],[data-lesson],.lesson-item"));
      const vis = cards.filter(c => { const r=c.getBoundingClientRect(); return r.width>20 && r.height>20; });
      if(vis.length){ vis[0].click(); return {n:vis.length, txt:(vis[0].innerText||"").trim().slice(0,40)}; }
      return {n:0};
    }""")
    L("  " + json.dumps(r, ensure_ascii=False))
    pg.wait_for_timeout(1800)

    L("\n=== 3. 题目区 DOM（进课后） ===")
    r2 = pg.evaluate("""() => {
      const sels = ["#stepText",".step-text","#stage",".stage",".question",".expr","#lessonTitle",".lesson-title"];
      const out = {};
      sels.forEach(s => { const e=document.querySelector(s); if(e) out[s]=(e.innerText||e.textContent||"").trim().slice(0,80); });
      out.btnNew = !!document.querySelector("#btnNew");
      return out;
    }""")
    L("  " + json.dumps(r2, ensure_ascii=False))

    L("\n=== 4. 连点 #btnNew 8 次，抓题目指纹 ===")
    r3 = pg.evaluate("""() => {
      const btn = document.querySelector("#btnNew");
      if(!btn) return {found:false};
      const grab = () => {
        const e = document.querySelector("#stepText") || document.querySelector(".step-text");
        if(e) return (e.innerText||e.textContent||"").trim().slice(0,60);
        return "";
      };
      const seq = [grab()];
      for(let i=0;i<8;i++){ btn.click(); seq.push(grab()); }
      return {found:true, seq: seq};
    }""")
    if r3.get("found"):
        seq = r3["seq"]
        L("  抓取序列:")
        for i,s in enumerate(seq): L("    [%d] %s" % (i, s))
        uniq = len(set([s for s in seq if s]))
        L("  唯一题目数: %d / %d" % (uniq, len(seq)))
    else:
        L("  #btnNew 未找到")

    L("\n=== 5. 截图存证 ===")
    pg.screenshot(path=os.path.join(D,"_shot_lesson.png"), full_page=False)
    L("  已保存 _shot_lesson.png")

    b.close()

L("\n=== 错误汇总: %d ===" % len(rep["errs"]))
for e in rep["errs"][:10]: L("  " + e[:150])
io.open(os.path.join(D,"_reroll_test.json"),"w",encoding="utf-8").write(json.dumps(rep,ensure_ascii=False,indent=2))
