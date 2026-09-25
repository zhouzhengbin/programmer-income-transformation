/* 语文游戏二：汉字描红（沿着虚线笔顺描出汉字） */
const GameStroke = (() => {
  const CHARS = [
    { ch:'一', pts:[[40,80],[160,80]] },
    { ch:'十', pts:[[100,30],[100,130]] },
    { ch:'人', pts:[[60,35],[110,135]] },
    { ch:'大', pts:[[60,35],[110,135]] },
    { ch:'口', pts:[[55,45],[145,45],[145,115],[55,115],[55,45]] },
  ];

  function render(host, api){
    let idx = 0, done = 0;
    host.innerHTML = `
      <div class="game-switch">
        <span class="game-hint">用手指或鼠标沿着虚线慢慢描 ✍️</span>
        <button class="chip" id="stClr">重新描</button>
        <button class="chip" id="stNxt">换一个字</button>
      </div>
      <div style="display:flex;gap:22px;flex-wrap:wrap;align-items:center;justify-content:center">
        <div style="position:relative">
          <canvas id="stCv" width="200" height="200"
            style="background:#fff;border-radius:24px;border:5px solid #d9e9ff;
                   box-shadow:0 8px 0 rgba(36,58,94,.12);touch-action:none;cursor:crosshair"></canvas>
          <div id="stTip" style="position:absolute;left:50%;bottom:-14px;transform:translateX(-50%);
            background:#fff;padding:6px 18px;border-radius:999px;font-weight:900;font-size:18px;
            color:#4aa8ff;box-shadow:0 4px 0 rgba(36,58,94,.12)">一</div>
        </div>
        <div style="max-width:320px">
          <div style="font-size:64px;text-align:center" id="stBig">一</div>
          <p style="font-weight:700;color:#3d5480;line-height:1.75;margin:10px 0 0">
            按笔顺描一遍，描完就能得到星星。<br>描得越准，星星越亮哦！
          </p>
          <div class="progress-wrap" style="margin-top:16px"><div class="progress-bar" id="stBar"></div></div>
        </div>
      </div>`;
    host.appendChild(host.querySelector('div'));

    const cv = host.querySelector('#stCv');
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    const bar = host.querySelector('#stBar');
    const tip = host.querySelector('#stTip');
    const big = host.querySelector('#stBig');

    let drawing = false, covered = 0, total = 0, canvasData = null;

    function drawGuide(){
      ctx.clearRect(0,0,200,200);
      // 田字格
      ctx.strokeStyle = '#eaf3ff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(100,0); ctx.lineTo(100,200);
      ctx.moveTo(0,100); ctx.lineTo(200,100); ctx.stroke();
      ctx.setLineDash([]);
      // 灰色参考字
      ctx.font = '900 150px "Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#e3edfa';
      ctx.fillText(CHARS[idx].ch, 100, 108);

      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      canvasData = ctx.getImageData(0,0,200,200);
      ctx.restore();
    }

    // 统计灰色像素总数（作为需要覆盖的目标）
    function countTarget(){
      drawGuide();
      const d = ctx.getImageData(0,0,200,200).data;
      total = 0;
      for(let i=0;i<d.length;i+=4){
        if(d[i]<250 && d[i+3]>100) total++;
      }
    }

    function dist(p, pts){
      let best = 1e9;
      for(let i=0;i<pts.length-1;i++){
        const [x1,y1]=pts[i], [x2,y2]=pts[i+1];
        const dx=x2-x1, dy=y2-y1;
        const L = dx*dx+dy*dy || 1;
        let t = ((p.x-x1)*dx + (p.y-y1)*dy)/L;
        t = Math.max(0, Math.min(1, t));
        const px = x1+t*dx, py = y1+t*dy;
        const dd = Math.hypot(p.x-px, p.y-py);
        if(dd<best) best = dd;
      }
      return best;
    }

    function toLocal(e){
      const r = cv.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      return { x:(p.clientX-r.left)*(200/r.width), y:(p.clientY-r.top)*(200/r.height) };
    }

    function down(e){
      e.preventDefault(); drawing = true;
      ctx.beginPath();
      const q = toLocal(e); ctx.moveTo(q.x,q.y);
      AudioKit.pick();
    }
    function move(e){
      if(!drawing) return;
      e.preventDefault();
      const q = toLocal(e);
      // 只允许在参考笔迹附近落笔，避免乱涂
      const near = dist(q, CHARS[idx].pts) < 40;
      ctx.lineWidth = 15; ctx.lineCap='round'; ctx.lineJoin='round';
      ctx.strokeStyle = near ? 'rgba(78,203,113,.95)' : 'rgba(255,107,139,.7)';
      ctx.lineTo(q.x, q.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(q.x,q.y);

      // 覆盖率
      const d = ctx.getImageData(0,0,200,200).data;
      let green = 0;
      for(let i=0;i<d.length;i+=4){
        if(d[i+1]>170 && d[i]<160) green++;
      }
      covered = green;
      const pct = Math.min(100, Math.round(covered/Math.max(1,total)*260));
      bar.style.width = pct + '%';
      if(pct >= 100 && !cv.dataset.ok){
        cv.dataset.ok = '1';
        AudioKit.correct(); AudioKit.star();
        AudioKit.speak(CHARS[idx].ch, 'zh-CN', 0.7);
        api.addStars(2); api.progress(); api.finish('这个字描得真漂亮！');
      }
    }
    function up(e){ if(drawing){ drawing=false; } }

    function reset(newChar){
      if(newChar){ idx = (idx+1)%CHARS.length; }
      cv.dataset.ok = '';
      covered = 0; bar.style.width = '0%';
      big.textContent = CHARS[idx].ch;
      tip.textContent = CHARS[idx].ch;
      countTarget();
      AudioKit.click();
      if(newChar) AudioKit.speak('认识新字：' + CHARS[idx].ch, 'zh-CN', 0.8);
    }

    cv.addEventListener('pointerdown', down);
    cv.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    host.querySelector('#stClr').onclick = ()=>reset(false);
    host.querySelector('#stNxt').onclick = ()=>reset(true);

    reset(false);
  }
  return { render, title:'汉字描红', hint:'沿着灰色汉字描一遍' };
})();
