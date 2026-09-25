/* 英语游戏二：颜色小画家（把颜色单词拖到对应色块） */
const GameColor = (() => {
  const DATA = [
    { word:'red',    hex:'#ff5a5a', cn:'红色' },
    { word:'yellow', hex:'#ffd93d', cn:'黄色' },
    { word:'blue',   hex:'#4aa8ff', cn:'蓝色' },
    { word:'green',  hex:'#4ecb71', cn:'绿色' },
    { word:'purple', hex:'#a06bff', cn:'紫色' },
    { word:'orange', hex:'#ffa552', cn:'橙色' },
  ];

  function render(host, api){
    host.innerHTML = `
      <div class="game-switch"><span class="game-hint">读一读颜色单词，拖到对应的颜色上 🎨</span></div>
      <div class="match-grid" style="grid-template-columns:minmax(150px,1fr) minmax(240px,2.4fr)">
        <div class="match-col" id="clSrc"></div>
        <div class="match-col" id="clDst" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr))"></div>
      </div>`;

    const src = host.querySelector('#clSrc');
    const dst = host.querySelector('#clDst');

    DATA.slice().sort(()=>Math.random()-0.5).forEach(d=>{
      const t = document.createElement('div');
      t.className = 'tile'; t.textContent = d.word; t.dataset.w = d.word;
      t.style.fontFamily = 'var(--font-num)';
      t.style.fontSize = 'clamp(20px,3.4vw,30px)';
      src.appendChild(t);
      DragKit.enable(t, {
        zoneSelector:'.cl-drop',
        onPick(){ AudioKit.pick(); AudioKit.speak(d.word, 'en-US', 0.7); },
        onDrop(el, zone){ check(el, zone); }
      });
    });

    DATA.slice().sort(()=>Math.random()-0.5).forEach(d=>{
      const z = document.createElement('div');
      z.className = 'tile dropzone cl-drop';
      z.dataset.w = d.word;
      z.style.background = d.hex;
      z.style.border = '5px solid #fff';
      z.style.minHeight = '120px';
      z.style.color = '#fff';
      z.style.textShadow = '0 2px 6px rgba(0,0,0,.35)';
      z.innerHTML = `<span style="font-size:20px;font-weight:900">${d.cn}</span>`;
      dst.appendChild(z);
    });

    function check(el, zone){
      if(zone.classList.contains('filled')) return;
      if(el.dataset.w === zone.dataset.w){
        zone.classList.add('filled','correct');
        zone.innerHTML = `<span style="font-family:var(--font-num);font-size:clamp(20px,3.2vw,28px);font-weight:900">${zone.dataset.w}</span>`;
        el.remove();
        AudioKit.correct();
        AudioKit.speak(zone.dataset.w, 'en-US', 0.7);
        api.addStars(1); api.progress();
        if(!src.querySelector('.tile')){ AudioKit.win(); api.finish('Colours 全对，你是小画家！'); }
      }else{
        zone.classList.add('wrong');
        setTimeout(()=>zone.classList.remove('wrong'), 500);
        AudioKit.wrong(); api.miss();
      }
    }
  }
  return { render, title:'颜色小画家', hint:'拖颜色单词到色块' };
})();
