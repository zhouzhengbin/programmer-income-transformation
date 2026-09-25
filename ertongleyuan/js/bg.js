/* ============================================================
   动态背景引擎 —— Canvas 粒子系统
   设计原则：节制。缓慢、柔和、不抢注意力，
   让孩子看久了不累，但每次抬头都有新东西在动。
   ============================================================ */
const BgScene = (() => {
  let cv, ctx, W, H, raf = null, running = false;
  let t = 0;
  const layers = [];
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 三层视差：远景慢、近景快，制造空间感
  function init(){
    cv = document.getElementById('bgCanvas');
    if(!cv) return;
    ctx = cv.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    build();
  }

  function resize(){
    if(!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function build(){
    layers.length = 0;
    // 云
    layers.push({ type:'cloud', items: mkClouds(3) });
    // 星星 / 花瓣 / 泡泡（随主题切换）
    layers.push({ type:'float', items: mkFloats(11) });
    // 底部草浪
    layers.push({ type:'wave', items: [] });
  }

  function mkClouds(n){
    const arr = [];
    for(let i=0;i<n;i++){
      arr.push({
        x: Math.random()*1600 - 200,
        y: 40 + Math.random()*220,
        s: 0.6 + Math.random()*0.9,
        v: 0.08 + Math.random()*0.12,
        o: 0.5 + Math.random()*0.35
      });
    }
    return arr;
  }

  const FLOAT_SYMBOLS = ['⭐','🌸','🍃','💧','🦋','✨','🌼','🍀'];
  function mkFloats(n){
    const arr = [];
    for(let i=0;i<n;i++){
      arr.push({
        x: Math.random()*1600,
        y: Math.random()*900,
        s: 10 + Math.random()*16,
        v: 0.15 + Math.random()*0.35,
        sway: Math.random()*Math.PI*2,
        swaySpd: 0.004 + Math.random()*0.01,
        rot: Math.random()*Math.PI,
        rotSpd: (Math.random()-0.5)*0.006,
        o: 0.28 + Math.random()*0.3,
        sym: FLOAT_SYMBOLS[Math.floor(Math.random()*FLOAT_SYMBOLS.length)]
      });
    }
    return arr;
  }

  function drawCloud(c){
    ctx.save();
    ctx.globalAlpha = c.o;
    ctx.fillStyle = '#ffffff';
    const x = c.x, y = c.y, s = c.s;
    ctx.beginPath();
    ctx.arc(x, y, 34*s, 0, Math.PI*2);
    ctx.arc(x + 40*s, y - 12*s, 44*s, 0, Math.PI*2);
    ctx.arc(x + 88*s, y, 32*s, 0, Math.PI*2);
    ctx.arc(x + 44*s, y + 14*s, 36*s, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function drawWave(){
    const baseY = H - 70;
    ctx.save();
    ctx.globalAlpha = 0.20;
    for(let layer=0; layer<2; layer++){
      const amp = 16 + layer*10;
      const spd = 0.0012 + layer*0.0006;
      const col = layer === 0 ? '#7ee08a' : '#4ecb71';
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for(let x=0; x<=W; x+=14){
        const y = baseY + layer*22 + Math.sin(x*0.006 + t*spd*1000 + layer)*amp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function frame(){
    if(!running) return;
    t += 1;
    ctx.clearRect(0,0,W,H);

    // 云
    const cl = layers[0];
    if(cl) cl.items.forEach(c=>{
      c.x += c.v;
      if(c.x > W + 220) c.x = -220;
      drawCloud(c);
    });

    // 漂浮物
    const fl = layers[1];
    if(fl) fl.items.forEach(f=>{
      f.y -= f.v;
      f.sway += f.swaySpd;
      f.rot += f.rotSpd;
      if(f.y < -40){ f.y = H + 40; f.x = Math.random()*W; }
      const dx = Math.sin(f.sway) * 26;
      ctx.save();
      ctx.globalAlpha = f.o;
      ctx.translate(f.x + dx, f.y);
      ctx.rotate(f.rot);
      ctx.font = f.s + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.sym, 0, 0);
      ctx.restore();
    });

    // 草浪
    drawWave();

    raf = requestAnimationFrame(frame);
  }

  function start(){
    if(running) return;
    running = true;
    if(reduced){ frame(); running = false; return; }  // 只画一帧
    frame();
  }
  function stop(){
    running = false;
    if(raf) cancelAnimationFrame(raf);
  }

  // 页面隐藏时停掉，省电
  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden) stop();
    else if(cv) start();
  });

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{ init(); start(); });
  }else{
    init(); start();
  }

  return { start, stop };
})();
