/* 语文游戏一：拼音找朋友（把声母/韵母拖到对应图片） */
const GamePinyin = (() => {
  const ROUNDS = [
    { pic:'🐴', word:'马', py:'mǎ',   ini:'m' },
    { pic:'🐟', word:'鱼', py:'yú',   ini:'y' },
    { pic:'🌺', word:'花', py:'huā',  ini:'h' },
    { pic:'🐘', word:'象', py:'xiàng',ini:'x' },
    { pic:'🍎', word:'果', py:'guǒ',  ini:'g' },
    { pic:'🐰', word:'兔', py:'tù',   ini:'t' },
  ];
  const PICK = ['m','y','h','x','g','t'];

  function render(host, api){
    host.innerHTML = '';
    const bar = document.createElement('div');
    bar.className = 'game-switch';
    bar.innerHTML = '<span class="game-hint">把左边的拼音拖到右边对应的图片上 👉</span>';
    host.appendChild(bar);

    const grid = document.createElement('div');
    grid.className = 'match-grid';
    grid.style.gridTemplateColumns = 'minmax(150px,1fr) minmax(210px,2fr)';
    grid.innerHTML = '<div class="match-col" id="pySrc"></div><div class="match-col" id="pyDst"></div>';
    host.appendChild(grid);

    const src = grid.querySelector('#pySrc');
    const dst = grid.querySelector('#pyDst');

    const order = PICK.slice().sort(()=>Math.random()-0.5);
    order.forEach(p=>{
      const t = document.createElement('div');
      t.className = 'tile';
      t.textContent = p;
      t.dataset.ini = p;
      src.appendChild(t);
      DragKit.enable(t, {
        zoneSelector:'.py-drop',
        onPick(){ AudioKit.pick(); AudioKit.speak(p, 'zh-CN', 0.9); },
        onDrop(el, zone){ check(el, zone); }
      });
    });

    const targets = ROUNDS.slice().sort(()=>Math.random()-0.5);
    targets.forEach(r=>{
      const z = document.createElement('div');
      z.className = 'tile dropzone py-drop';
      z.dataset.ini = r.ini;
      z.innerHTML = `<span style="font-size:44px">${r.pic}</span>
        <span style="font-size:19px;font-weight:800;color:#3d5480;margin-top:4px">${r.word} ${r.py}</span>`;
      dst.appendChild(z);
    });

    function check(el, zone){
      if(zone.classList.contains('filled')) return;
      if(el.dataset.ini === zone.dataset.ini){
        zone.classList.add('filled','correct');
        el.remove();
        AudioKit.correct();
        AudioKit.speak(zone.textContent.trim(), 'zh-CN', 0.8);
        api.addStars(1);
        api.progress();
        if(!src.querySelector('.tile')){ AudioKit.win(); api.finish('太厉害了！拼音全部找到朋友啦！'); }
      }else{
        zone.classList.add('wrong');
        setTimeout(()=>zone.classList.remove('wrong'), 500);
        AudioKit.wrong();
        api.miss();
      }
    }
  }
  return { render, title:'拼音找朋友', hint:'拖一拖，让拼音和图片手拉手' };
})();
