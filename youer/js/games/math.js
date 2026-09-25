/* 数学游戏二：加减小火车（把正确答案拖到车厢上） */
const GameMath = (() => {
  function makeQ(){
    const plus = Math.random() > 0.45;
    if(plus){
      const a = 1 + Math.floor(Math.random()*5);
      const b = 1 + Math.floor(Math.random()*5);
      return { text:`${a} + ${b}`, ans:a+b };
    }else{
      const a = 4 + Math.floor(Math.random()*5);
      const b = 1 + Math.floor(Math.random()*(a-1));
      return { text:`${a} − ${b}`, ans:a-b };
    }
  }

  function render(host, api){
    let q = makeQ();
    let round = 0;
    const TOTAL = 6;

    host.innerHTML = `
      <div class="game-switch">
        <span class="game-hint" id="mmHint">算出答案，把数字拖到小火车车厢上 🚂</span>
        <button class="chip" id="mmSkip">跳过这题</button>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:clamp(16px,3vw,30px)">
        <div id="mmTrain" style="
          display:flex;align-items:center;gap:14px;padding:20px 26px;border-radius:28px;
          background:linear-gradient(140deg,#fff3b0,#ffd93d);box-shadow:0 8px 0 rgba(255,193,61,.55);
          font-family:var(--font-num);font-weight:900;font-size:clamp(30px,5.4vw,50px);color:#7a4a00">
          <span>🚂</span><span id="mmQ"></span><span>=</span>
          <span class="dropzone mm-drop" id="mmAns" style="
            display:inline-grid;place-items:center;min-width:clamp(80px,14vw,120px);height:clamp(70px,12vw,104px);
            background:#fff;border-radius:20px;border:5px dashed #f0a500;padding:0 10px">?</span>
        </div>
        <div id="mmPool" style="display:flex;gap:clamp(10px,2vw,18px);flex-wrap:wrap;justify-content:center"></div>
        <div class="progress-wrap" style="width:min(560px,92%)"><div class="progress-bar" id="mmBar"></div></div>
      </div>`;

    const qEl = host.querySelector('#mmQ');
    const pool = host.querySelector('#mmPool');
    const ansBox = host.querySelector('#mmAns');
    const bar = host.querySelector('#mmBar');

    function buildPool(){
      pool.innerHTML = '';
      ansBox.textContent = '?';
      ansBox.classList.remove('filled');
      ansBox.dataset.ans = q.ans;
      qEl.textContent = q.text;
      const opts = new Set([q.ans]);
      while(opts.size < 4){
        const d = q.ans + (Math.floor(Math.random()*7) - 3);
        if(d > 0 && d < 13) opts.add(d);
      }
      [...opts].sort(()=>Math.random()-0.5).forEach(v=>{
        const t = document.createElement('div');
        t.className = 'tile'; t.textContent = v; t.dataset.v = v;
        t.style.minWidth = '82px'; t.style.fontSize = 'clamp(24px,4vw,36px)';
        pool.appendChild(t);
        DragKit.enable(t, {
          zoneSelector:'.mm-drop',
          onPick(){ AudioKit.pick(); AudioKit.speak(String(v), 'zh-CN', 0.85); },
          onDrop(el, zone){ check(el, zone); }
        });
      });
      AudioKit.speak(q.text + ' 等于几', 'zh-CN', 0.8);
    }

    function check(el, zone){
      if(zone.classList.contains('filled')) return;
      if(Number(el.dataset.v) === q.ans){
        zone.classList.add('filled','correct');
        zone.textContent = q.ans;
        AudioKit.correct(); AudioKit.star();
        AudioKit.speak('答对啦，等于 ' + q.ans, 'zh-CN', 0.8);
        api.addStars(2); round++;
        bar.style.width = Math.round(round/TOTAL*100) + '%';
        if(round >= TOTAL){
          AudioKit.win(); api.finish('六道题全对，小火车开动啦！');
        }else{
          setTimeout(()=>{ q = makeQ(); buildPool(); }, 1900);
        }
      }else{
        zone.classList.add('wrong');
        setTimeout(()=>zone.classList.remove('wrong'), 500);
        AudioKit.wrong(); api.miss();
      }
    }

    host.querySelector('#mmSkip').onclick = ()=>{ q = makeQ(); buildPool(); AudioKit.click(); };
    buildPool();
  }
  return { render, title:'加减小火车', hint:'拖动数字完成算式' };
})();
