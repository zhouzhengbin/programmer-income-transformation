/* 英语游戏一：字母开头配（把首字母拖到对应单词图片） */
const GameLetter = (() => {
  const DATA = [
    { pic:'🍎', word:'apple',  letter:'A' },
    { pic:'🐻', word:'bear',   letter:'B' },
    { pic:'🐱', word:'cat',    letter:'C' },
    { pic:'🐶', word:'dog',    letter:'D' },
    { pic:'🐘', word:'elephant',letter:'E' },
    { pic:'🐟', word:'fish',   letter:'F' },
  ];

  function render(host, api){
    host.innerHTML = `
      <div class="game-switch"><span class="game-hint">这个单词以哪个字母开头？拖过去 🔤</span></div>
      <div class="match-grid" style="grid-template-columns:minmax(140px,1fr) minmax(220px,2.6fr)">
        <div class="match-col" id="ltSrc"></div>
        <div class="match-col" id="ltDst"></div>
      </div>`;

    const src = host.querySelector('#ltSrc');
    const dst = host.querySelector('#ltDst');

    DATA.map(d=>d.letter).sort(()=>Math.random()-0.5).forEach(L=>{
      const t = document.createElement('div');
      t.className = 'tile'; t.textContent = L; t.dataset.l = L;
      src.appendChild(t);
      DragKit.enable(t, {
        zoneSelector:'.lt-drop',
        onPick(){ AudioKit.pick(); AudioKit.speak(L, 'en-US', 0.75); },
        onDrop(el, zone){ check(el, zone); }
      });
    });

    DATA.slice().sort(()=>Math.random()-0.5).forEach(d=>{
      const z = document.createElement('div');
      z.className = 'tile dropzone lt-drop';
      z.dataset.l = d.letter;
      z.innerHTML = `<span style="font-size:44px">${d.pic}</span>
        <span style="font-family:var(--font-num);font-size:clamp(19px,3vw,27px);color:#2fa855;font-weight:900">${d.word}</span>`;
      dst.appendChild(z);
    });

    function check(el, zone){
      if(zone.classList.contains('filled')) return;
      if(el.dataset.l === zone.dataset.l){
        zone.classList.add('filled','correct');
        el.remove();
        AudioKit.correct();
        const w = zone.querySelector('span:last-child').textContent;
        AudioKit.speak(w, 'en-US', 0.75);
        api.addStars(1); api.progress();
        if(!src.querySelector('.tile')){ AudioKit.win(); api.finish('Perfect! 字母全对啦！'); }
      }else{
        zone.classList.add('wrong');
        setTimeout(()=>zone.classList.remove('wrong'), 500);
        AudioKit.wrong(); api.miss();
      }
    }
  }
  return { render, title:'字母开头配', hint:'拖字母到对应单词' };
})();
