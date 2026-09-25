import asyncio, json
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        pg = await b.new_page(viewport={"width":1280,"height":900})
        errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE:"+m.text) if m.type=="error" else None)
        await pg.goto("http://127.0.0.1:8899/index.html")
        await pg.wait_for_timeout(1800)
        R={}
        # 21 游戏
        t=await pg.evaluate("""()=>{const G={G_Pinyin,G_Stroke,G_Poem,G_Song,G_Antonym,G_Count,G_Math,G_Shape,G_Compare,G_Pattern,G_Clock,G_Letter,G_Color,G_Words,G_ColorFill,G_Memory,G_Bubble,G_Puzzle,G_Sort,G_Shadow,G_Habit};let ok=0,bad=[];for(const[k,v]of Object.entries(G)){try{const h=document.createElement("div");h.style.cssText="position:absolute;left:-9999px";document.body.appendChild(h);v.render(h,{addStars(){},progress(){},finish(){},miss(){}});ok++;h.remove();}catch(e){bad.push(k+":"+e);}}return{ok,bad};}""")
        R["games"]=t
        # 影子
        R["shadow"]=await pg.evaluate("""()=>{const h=document.createElement("div");document.body.appendChild(h);G_Shadow.render(h,{addStars(){},progress(){},finish(){},miss(){}});const f=[...h.querySelectorAll(".shadow-figure")];return{count:f.length,dark:f.every(x=>getComputedStyle(x).filter.includes("brightness(0)"))};}""")
        # 拼图
        R["puzzle"]=await pg.evaluate("""()=>{const h=document.createElement("div");document.body.appendChild(h);G_Puzzle.render(h,{addStars(){},progress(){},finish(){},miss(){}});const c=[...h.querySelectorAll(".puz-piece canvas")];const hs=c.map(x=>{const d=x.getContext("2d").getImageData(0,0,x.width,x.height).data;let s=0;for(let i=0;i<d.length;i+=53)s=(s*31+d[i])%9999991;return s;});return{pieces:c.length,unique:new Set(hs).size};}""")
        R["poems"]=await pg.evaluate("()=>DATA.chinese.poems.length")
        R["songs"]=await pg.evaluate("()=>DATA.chinese.songs.length")
        R["errors"]=errs[:10]
        print(json.dumps(R,ensure_ascii=False,indent=1))

        # 截三张修复图
        await pg.evaluate("""()=>{document.querySelectorAll("main > section").forEach(s=>s.classList.remove("active"));const h=document.createElement("section");h.className="view active";h.id="_sh";document.querySelector("main").appendChild(h);G_Shadow.render(h,{addStars(){},progress(){},finish(){},miss(){}});}""")
        await pg.wait_for_timeout(500); await pg.locator("#_sh").screenshot(path="../shot_shadow.png")
        await pg.evaluate("""()=>{document.querySelectorAll("main > section").forEach(s=>s.classList.remove("active"));const h=document.createElement("section");h.className="view active";h.id="_pz";document.querySelector("main").appendChild(h);G_Puzzle.render(h,{addStars(){},progress(){},finish(){},miss(){}});}""")
        await pg.wait_for_timeout(500); await pg.locator("#_pz").screenshot(path="../shot_puzzle.png")
        await pg.evaluate("""()=>{document.querySelectorAll("main > section").forEach(s=>s.classList.remove("active"));const h=document.createElement("section");h.className="view active";h.id="_sg";document.querySelector("main").appendChild(h);G_Song.render(h,{addStars(){},progress(){},finish(){},miss(){}});}""")
        await pg.wait_for_timeout(500); await pg.locator("#_sg").screenshot(path="../shot_song.png")
        await b.close()
    print("截图完成")
asyncio.run(main())
