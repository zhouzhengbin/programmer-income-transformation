/* 语文2：汉字描红 */
const G_Stroke = (()=>{
  function render(host, api){
    const list = DATA.chinese.hanzi;
    let idx = 0;
    host.innerHTML = `
      <div class="hint-bar">沿着灰色汉字慢慢描 ✍️</div>
      <div class="stroke-wrap">
        <div style="position:relative">
          <canvas id="stCv" width="240" height="240" class="stroke-canvas"></canvas>
          <div class="stroke-label" id="stLabel">一</div>
        </div>
        <div class="stroke-side">
          <div class="stroke-big" id="stBig">一</div>
          <div class="stroke-meta" id="stMeta"></div>
          <button class="chip" id="stPlay">🔊 读一遍</button>
          <button class="chip" id="stReset">重新描</button>
          <button class="chip" id="stNext">换一个字</button>
          <div class="progress-wrap" style="margin-top:14px"><div class="progress-bar" id="stBar"></div></div>
        </div>
      </div>`;
    const cv = Kit.$('#stCv',host), ctx = cv.getContext('2d',{willReadFrequently:true});
    const bar = Kit.$('#stBar',host), big = Kit.$('#stBig',host),
          lab = Kit.$('#stLabel',host), meta = Kit.$('#stMeta',host);
    let drawing=false, total=0, done=false;
    function guide(){
      ctx.clearRect(0,0,240,240);
      ctx.strokeStyle='#eef4fc'; ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.moveTo(120,0); ctx.lineTo(120,240);
      ctx.moveTo(0,120); ctx.lineTo(240,120);
      ctx.stroke();
      ctx.font='900 180px "Microsoft YaHei",sans-serif';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillStyle='#e6eefa';
      ctx.fillText(list[idx].ch, 120, 128);
      const d = ctx.getImageData(0,0,240,240).data;
      total = 0;
      for(let i=0;i<d.length;i+=4){ if(d[i]<250 && d[i+3]>80) total++; }
    }
    function local(e){
      const r = cv.getBoundingClientRect();
      return { x:(e.clientX-r.left)*(240/r.width), y:(e.clientY-r.top)*(240/r.height) };
    }
    function dist(p, pts){
      let best=1e9;
      for(let i=0;i<pts.length-1;i++){
        const x1=pts[i][0], y1=pts[i][1], x2=pts[i+1][0], y2=pts[i+1][1];
        const dx=x2-x1, dy=y2-y1, L=(dx*dx+dy*dy)||1;
        let t=((p.x-x1)*dx+(p.y-y1)*dy)/L; t=Math.max(0,Math.min(1,t));
        const d=Math.hypot(p.x-(x1+t*dx), p.y-(y1+t*dy));
        if(d<best) best=d;
      }
      return best;
    }
    function down(e){ e.preventDefault(); drawing=true; ctx.beginPath();
      const q=local(e); ctx.moveTo(q.x,q.y); }
    function move(e){
      if(!drawing) return; e.preventDefault();
      const q=local(e);
      const near = dist(q, list[idx].pts) < 55;
      ctx.lineWidth=17; ctx.lineCap='round'; ctx.lineJoin='round';
      ctx.strokeStyle = near ? 'rgba(78,203,113,.95)' : 'rgba(255,107,139,.65)';
      ctx.lineTo(q.x,q.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(q.x,q.y);
      const d = ctx.getImageData(0,0,240,240).data;
      let g=0;
      for(let i=0;i<d.length;i+=4){ if(d[i+1]>170 && d[i]<160) g++; }
      const pct = Math.min(100, Math.round(g/Math.max(1,total)*280));
      bar.style.width = pct+'%';
      if(pct>=100 && !done){
        done=true; AudioKit.correct(); AudioKit.star();
        AudioKit.speak(list[idx].ch,'zh-CN',0.7);
        api.addStars(2); api.progress(); api.finish('这个字描得真漂亮！');
      }
    }
    function up(){ drawing=false; }
    function load(next){
      if(next) idx=(idx+1)%list.length;
      done=false; bar.style.width='0%';
      const h = list[idx];
      big.textContent=h.ch; lab.textContent=h.ch;
      meta.innerHTML = '拼音 <b>'+h.py+'</b> · '+h.mean+' · '+h.strokes+'画';
      guide();
      if(next) AudioKit.speak(h.ch,'zh-CN',0.75);
    }
    cv.addEventListener('pointerdown',down);
    cv.addEventListener('pointermove',move);
    window.addEventListener('pointerup',up);
    Kit.$('#stReset',host).onclick = ()=>{ load(false); AudioKit.click(); };
    Kit.$('#stNext',host).onclick  = ()=>{ load(true); };
    Kit.$('#stPlay',host).onclick  = ()=>{ AudioKit.speak(list[idx].ch,'zh-CN',0.7); };
    load(false);
  }
  return { render, title:'汉字描红', icon:'✍️', hint:'沿着灰色字描写' };
})();