/* 综合1：点泡泡（限时反应） */
const G_Bubble = (()=>{
  function render(host, api){
    host.innerHTML = `<div class="hint-bar">点破写着正确答案的泡泡 🫧</div><div id="bubBox"></div>`;
    // 生成题目：拼音 / 汉字 / 英文混搭
    const pool = [];
    DATA.chinese.pinyinWords.slice(0,8).forEach(w=>{
      pool.push({ q:'哪个是「'+w.word+'」的拼音？', right:w.py,
        wrongs: Kit.shuffle(DATA.chinese.pinyinWords.filter(x=>x.py!==w.py)).slice(0,3).map(x=>x.py),
        say: w.word });
    });
    DATA.english.animals.slice(0,8).forEach(a=>{
      pool.push({ q:'哪个是「'+a.cn+'」的英文？', right:a.en,
        wrongs: Kit.shuffle(DATA.english.animals.filter(x=>x.en!==a.en)).slice(0,3).map(x=>x.en),
        say: a.en });
    });

    let qIdx = 0, round = 0;
    const qBox = Kit.el('div','bub-question');
    host.appendChild(qBox);

    function nextQ(){
      if(round >= 5){
        api.finish('反应真快，全答完啦！');
        return;
      }
      const q = pool[qIdx % pool.length]; qIdx++;
      qBox.innerHTML = '<span class="bq-text">'+q.q+'</span>';
      AudioKit.speak(q.q.replace(/[？?]/g,''),'zh-CN',0.85);
      const items = [q.right, ...q.wrongs].map(t=>({ label:t, ok:t===q.right }));
      bubbles = Kit.makeBubbles(host, {
        items: Kit.shuffle(items).concat(Kit.shuffle(items)),
        duration: 20,
        onHit: (ok)=>{
          if(ok){
            round++;
            api.addStars(1); api.progress();
          }
        },
        onEnd: ()=>{ /* 时间到就换题 */ }
      });
    }

    let bubbles = null;
    nextQ();
    // 每答对一题，8 秒后换新题
    const iv = setInterval(()=>{
      if(round >= 5){ clearInterval(iv); return; }
      const bs = Kit.$('#bubBox',host);
      if(!bs) { clearInterval(iv); return; }
    }, 800);
  }
  return { render, title:'点泡泡', icon:'🫧', hint:'限时点出正确答案' };
})();