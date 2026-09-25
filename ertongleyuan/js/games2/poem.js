/* 语文3：古诗诵读 */
const G_Poem = (()=>{
  function render(host, api){
    const poem = Kit.pick(DATA.chinese.poems);
    let heard = 0;
    const titleText = poem.title + "，" + poem.author + "作";
    host.innerHTML = `
      <div class="hint-bar">先听诗名，再点每一句听老师读古诗 📜</div>
      <div class="poem-card">
        <div class="poem-head">
          <span class="poem-emoji">${poem.emoji}</span>
          <div>
            <div class="poem-title" id="pmTitle" role="button" tabindex="0">${poem.title} 🔊</div>
            <div class="poem-author">〔${poem.dynasty||'唐'}〕${poem.author}</div>
          </div>
        </div>
        <div class="poem-lines" id="poemLines"></div>
        <div class="poem-actions">
          <button class="chip" id="pmAll">📜 连读一遍</button>
          <button class="chip" id="pmNext">换一首</button>
        </div>
        <div class="progress-wrap" style="margin-top:16px"><div class="progress-bar" id="pmBar"></div></div>
      </div>`;
    const box = Kit.$('#poemLines',host);

    // 读标题 + 作者
    const readTitle = ()=>{
      AudioKit.speak(poem.title + "。" + poem.author, "zh-CN", 0.72, 1.08);
    };
    const titleEl = Kit.$('#pmTitle',host);
    titleEl.onclick = ()=>{ AudioKit.click(); readTitle(); };
    titleEl.onkeydown = (e)=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); readTitle(); } };

    poem.lines.forEach((line,i)=>{
      const b = Kit.el("button","poem-line");
      b.type="button";
      b.innerHTML = "<span class=\"poem-idx\">"+(i+1)+"</span><span class=\"poem-text\">"+line+"</span>";
      b.onclick = ()=>{
        AudioKit.speak(line.replace(/[，。！？、]/g,""),"zh-CN",0.62,1.05);
        if(!b.classList.contains("read")){
          b.classList.add("read");
          heard++;
          AudioKit.star();
          api.addStars(1);
          Kit.setBar("pmBar", heard/poem.lines.length*100);
          if(heard===poem.lines.length){ AudioKit.speak(poem.title+"读完了，真棒","zh-CN",0.8,1.1); api.finish("整首古诗都读完啦！"); }
        }
      };
      box.appendChild(b);
    });

    // 连读：标题 -> 作者 -> 每句
    Kit.$("#pmAll",host).onclick = ()=>{
      AudioKit.click();
      let i = -1;
      const seq = [titleText].concat(poem.lines.map(l=>l.replace(/[，。！？、]/g,"")));
      const step = ()=>{
        i++;
        if(i>=seq.length) return;
        const isTitle = (i===0);
        AudioKit.speak(seq[i], "zh-CN", isTitle?0.72:0.6, isTitle?1.08:1.05);
        setTimeout(step, isTitle?2000:2400);
      };
      step();
    };
    Kit.$("#pmNext",host).onclick = ()=>{ AudioKit.click(); render(host, api); };

    // 进入后自动报诗名
    setTimeout(readTitle, 420);
  }
  return { render, title:"古诗诵读", icon:"📜", hint:"点句子听朗读" };
})();
