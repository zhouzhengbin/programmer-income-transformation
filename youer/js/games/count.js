/* 数学游戏一：数一数（把数字拖到对应数量的小动物上） */
const GameCount = (() => {
  const SETS = [
    { emoji:'🐤', n:3 }, { emoji:'🍓', n:5 }, { emoji:'🐞', n:2 },
    { emoji:'⭐', n:6 }, { emoji:'🎈', n:4 }, { emoji:'🐠', n:7 },
  ];

  function render(host, api){
    host.innerHTML = `
      <div class="game-switch"><span class="game-hint">数一数有几只，把数字拖过去 🔢</span></div>
      <div class="match-grid" style="grid-template-columns:minmax(140px,1fr) minmax(220px,2.6fr)">
        <div class="match-col" id="ctSrc"></div>
        <div class="match-col" id="ctDst"></div>
      </div>`;

    const src = host.querySelector('#ctSrc');
    const dst = host.querySelector('#ctDst');

    const nums = SETS.map(s=>s.n).sort(()=>Math.random()-0.5);
    nums.forEach(n=>{
      const t = document.createElement('div');
      t.className = 'tile'; t.textContent = n; t.dataset.n = n;
      src.appendChild(t);
      DragKit.enable(t, {
        zoneSelector:'.ct-drop',
        onPick(){ AudioKit.pick(); AudioKit.speak(String(n), 'zh-CN', 0.8); },
        onDrop(el, zone){ check(el, zone); }
      });
    });

    SETS.slice().sort(()=>Math.random()-0.5).forEach(s=>{
      const z = document.createElement('div');
      z.className = 'tile dropzone ct-drop';
      z.dataset.n = s.n;
      z.style.fontSize = '30px';
      z.style.lineHeight = '1.3';
      z.style.letterSpacing = '6px';
      z.innerHTML = `<div style="max-width:100%;text-align:center">${s.emoji.repeat(s.n)}</div>`;
      dst.appendChild(z);
    });

    function check(el, zone){
      if(zone.classList.contains('filled')) return;
      if(el.dataset.n === zone.dataset.n){
        zone.classList.add('filled','correct');
        el.remove();
        AudioKit.correct();
        AudioKit.speak('对了，一共 ' + zone.dataset.n + ' 个', 'zh-CN', 0.8);
        api.addStars(1); api.progress();
        if(!src.querySelector('.tile')){ AudioKit.win(); api.finish('全部数对啦，你是数学小天才！'); }
      }else{
        zone.classList.add('wrong');
        setTimeout(()=>zone.classList.remove('wrong'), 500);
        AudioKit.wrong(); api.miss();
      }
    }
  }
  return { render, title:'数一数', hint:'数字和数量配对' };
})();
