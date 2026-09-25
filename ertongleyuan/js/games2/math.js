/* 数学2：加减小火车 */
const G_Math = (()=>{
  function makeQ(level){
    const max = level === 2 ? 20 : 10;
    if(Math.random() > 0.45){
      const a = Kit.rand(1, level===2 ? 10 : 5);
      const b = Kit.rand(1, level===2 ? 10 : 5);
      return { text:a+' + '+b, ans:a+b };
    }else{
      const a = Kit.rand(4, max);
      const b = Kit.rand(1, a-1);
      return { text:a+' − '+b, ans:a-b };
    }
  }
  function render(host, api){
    let level = 1, q = makeQ(level), round = 0;
    const TOTAL = 6;
    host.innerHTML = `
      <div class="hint-bar">算出答案，拖到小火车车厢上 🚂</div>
      <div class="game-switch">
        <button class="chip active" data-lv="1">10 以内</button>
        <button class="chip" data-lv="2">20 以内</button>
      </div>
      <div class="train-wrap">
        <div class="train">
          <span>🚂</span><span id="mmQ"></span><span class="eq">=</span>
          <span class="dropzone mm-drop" id="mmAns">?</span>
        </div>
        <div id="mmPool" class="tile-pool"></div>
        <div class="progress-wrap" style="width:min(520px,92%)"><div class="progress-bar" id="mmBar"></div></div>
      </div>`;
    const qEl = Kit.$('#mmQ',host), pool = Kit.$('#mmPool',host), ansBox = Kit.$('#mmAns',host);
    function buildPool(){
      pool.innerHTML = '';
      ansBox.textContent = '?'; ansBox.classList.remove('filled');
      ansBox.dataset.ans = q.ans;
      qEl.textContent = q.text;
      const opts = new Set([q.ans]);
      while(opts.size < 4){
        const d = q.ans + Kit.rand(-3,3);
        if(d > 0 && d < 25) opts.add(d);
      }
      Kit.shuffle([...opts]).forEach(v=>{
        const t = Kit.el('div','tile', v);
        t.dataset.v = v;
        t.style.minWidth = '78px';
        pool.appendChild(t);
        Kit.makeDraggable(t,{
          zoneSelector:'.mm-drop',
          onPick: ()=>{ AudioKit.pick(); AudioKit.speak(String(v),'zh-CN',0.85); },
          onDrop: (node,z)=>check(node,z)
        });
      });
      AudioKit.speak(q.text.replace('−','减')+' 等于几','zh-CN',0.8);
    }
    function check(node, z){
      if(z.classList.contains('filled')) return;
      if(Number(node.dataset.v) === q.ans){
        z.classList.add('filled','correct');
        z.textContent = q.ans;
        AudioKit.correct(); AudioKit.star();
        AudioKit.speak('答对啦，等于'+q.ans,'zh-CN',0.8);
        api.addStars(2); round++;
        Kit.setBar('mmBar', round/TOTAL*100);
        if(round >= TOTAL){ api.finish('六道题全对，小火车开动啦！'); }
        else setTimeout(()=>{ q = makeQ(level); buildPool(); }, 1900);
      }else{
        z.classList.add('wrong'); setTimeout(()=>z.classList.remove('wrong'),480);
        AudioKit.wrong(); api.miss();
      }
    }
    host.querySelectorAll('[data-lv]').forEach(b=>{
      b.onclick = ()=>{
        host.querySelectorAll('[data-lv]').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        level = Number(b.dataset.lv);
        round = 0; Kit.setBar('mmBar',0);
        q = makeQ(level); buildPool(); AudioKit.click();
      };
    });
    buildPool();
  }
  return { render, title:'加减小火车', icon:'🚂', hint:'拖数字完成算式' };
})();