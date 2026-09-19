/* =========================================================
   fx.js —— Canvas 电影级粒子 & 场景引擎
   零依赖 · 移动端优先 · 60fps
   ========================================================= */
var Stage = (function(){
  var cv, cx, W, H, DPR, raf = null, running = false;
  var parts = [], bg = [], stars = [];
  var t0 = Date.now();
  var touchPt = {x:-999, y:-999, active:false};
  var REDUCED = false;

  /* ---------- 粒子形状 ---------- */
  function drawStar(c, r, rot, color){
    c.save(); c.rotate(rot); c.beginPath();
    for(var i=0;i<5;i++){
      var a1 = (Math.PI*2*i/5) - Math.PI/2;
      var a2 = a1 + Math.PI/5;
      c.lineTo(Math.cos(a1)*r, Math.sin(a1)*r);
      c.lineTo(Math.cos(a2)*r*0.45, Math.sin(a2)*r*0.45);
    }
    c.closePath(); c.fillStyle = color; c.fill();
    c.restore();
  }

  function drawPetal(c, r, rot, color){
    c.save(); c.rotate(rot); c.beginPath();
    c.moveTo(0, -r);
    c.bezierCurveTo(r*0.9, -r*0.5, r*0.7, r*0.6, 0, r);
    c.bezierCurveTo(-r*0.7, r*0.6, -r*0.9, -r*0.5, 0, -r);
    c.fillStyle = color; c.fill();
    c.restore();
  }

  function drawHeart(c, r, rot, color){
    c.save(); c.rotate(rot); c.beginPath();
    c.moveTo(0, r*0.35);
    c.bezierCurveTo(r*1.2, -r*0.5, r*0.45, -r*1.15, 0, -r*0.42);
    c.bezierCurveTo(-r*0.45, -r*1.15, -r*1.2, -r*0.5, 0, r*0.35);
    c.fillStyle = color; c.fill();
    c.restore();
  }

  function drawBubble(c, r, rot, color){
    c.save(); c.beginPath();
    c.arc(0, 0, r, 0, Math.PI*2);
    var g = c.createRadialGradient(-r*0.3,-r*0.3,r*0.1, 0,0,r);
    g.addColorStop(0, "rgba(255,255,255,.95)");
    g.addColorStop(1, color);
    c.fillStyle = g; c.fill();
    c.restore();
  }

  var SHAPES = { star: drawStar, petal: drawPetal, heart: drawHeart, bubble: drawBubble };

  var PALETTE = ["#FFD75E","#FF9EC4","#8FD3FE","#A8E6A3","#C9B6FF","#FFC08A","#FF7BA9","#7BC8F6"];

  /* ---------- 粒子对象 ---------- */
  function Particle(x, y, opt){
    opt = opt || {};
    this.x = x; this.y = y;
    var ang = opt.angle !== undefined ? opt.angle : (Math.random()*Math.PI*2);
    var spd = opt.speed !== undefined ? opt.speed : (2 + Math.random()*6);
    this.vx = Math.cos(ang)*spd;
    this.vy = Math.sin(ang)*spd - (opt.lift || 2.5);
    this.r = opt.r || (5 + Math.random()*7);
    this.rot = Math.random()*Math.PI*2;
    this.vr = (Math.random()-0.5)*0.28;
    this.shape = opt.shape || ["star","petal","heart","bubble"][(Math.random()*4)|0];
    this.color = opt.color || PALETTE[(Math.random()*PALETTE.length)|0];
    this.life = 1;
    this.decay = opt.decay || (0.011 + Math.random()*0.012);
    this.grav = opt.grav !== undefined ? opt.grav : 0.16;
    this.drag = opt.drag !== undefined ? opt.drag : 0.985;
    this.spin = opt.spin !== undefined ? opt.spin : 1;
  }
  Particle.prototype.step = function(dt){
    this.vy += this.grav*dt;
    this.vx *= this.drag; this.vy *= this.drag;
    this.x += this.vx*dt; this.y += this.vy*dt;
    this.rot += this.vr*this.spin*dt;
    this.life -= this.decay*dt;
  };
  Particle.prototype.draw = function(c){
    var a = Math.max(0, Math.min(1, this.life));
    c.globalAlpha = a;
    var s = 1 + (1-a)*0.35;
    c.save(); c.translate(this.x, this.y); c.scale(s, s);
    (SHAPES[this.shape] || drawStar)(c, this.r, this.rot, this.color);
    c.restore();
    c.globalAlpha = 1;
  };

  /* ---------- 环境粒子（常驻漂浮） ---------- */
  function EnvParticle(){
    this.reset(true);
  }
  EnvParticle.prototype.reset = function(init){
    this.x = Math.random()*W;
    this.y = init ? Math.random()*H : H + 30;
    this.r = 2.5 + Math.random()*4.5;
    this.vy = -(0.18 + Math.random()*0.42);
    this.vx = (Math.random()-0.5)*0.35;
    this.phase = Math.random()*Math.PI*2;
    this.amp = 8 + Math.random()*18;
    this.shape = Math.random() < 0.55 ? "star" : "petal";
    this.color = PALETTE[(Math.random()*PALETTE.length)|0];
    this.rot = Math.random()*Math.PI*2;
    this.vr = (Math.random()-0.5)*0.02;
    this.a = 0.18 + Math.random()*0.34;
  };
  EnvParticle.prototype.step = function(dt, t){
    this.y += this.vy*dt;
    this.x += (this.vx + Math.sin(t*0.0011 + this.phase)*0.28)*dt;
    this.rot += this.vr*dt;
    if(this.y < -30){ this.reset(false); }
  };
  EnvParticle.prototype.draw = function(c, t){
    c.globalAlpha = this.a * (0.7 + 0.3*Math.sin(t*0.002 + this.phase));
    c.save(); c.translate(this.x, this.y);
    (SHAPES[this.shape] || drawStar)(c, this.r, this.rot, this.color);
    c.restore();
    c.globalAlpha = 1;
  };

  /* ---------- 触控光晕 ---------- */
  var ripples = [];
  function ripple(x, y, color){
    ripples.push({x:x, y:y, r:6, max:70 + Math.random()*40, a:0.65, c:color||"#FFD75E"});
  }

  /* ---------- 主循环 ---------- */
  var lastT = 0;
  function loop(now){
    if(!running) return;
    var dt = Math.min(2.4, (now - lastT)/16.667 || 1);
    lastT = now;

    cx.clearRect(0,0,W,H);

    /* 环境层 */
    if(!REDUCED){
      for(var i=0;i<bg.length;i++){ bg[i].step(dt, now); bg[i].draw(cx, now); }
    }

    /* 触控涟漪 */
    for(var i=ripples.length-1;i>=0;i--){
      var rp = ripples[i];
      rp.r += 3.4*dt; rp.a -= 0.026*dt;
      if(rp.a <= 0 || rp.r >= rp.max){ ripples.splice(i,1); continue; }
      cx.save(); cx.globalAlpha = rp.a;
      cx.strokeStyle = rp.c; cx.lineWidth = 3.5;
      cx.beginPath(); cx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2); cx.stroke();
      cx.restore();
    }

    /* 爆发层 */
    for(var i=parts.length-1;i>=0;i--){
      var p = parts[i];
      p.step(dt);
      if(p.life <= 0 || p.y > H + 90){ parts.splice(i,1); continue; }
      p.draw(cx);
    }

    /* 上限保护，防止卡顿 */
    if(parts.length > 320) parts.splice(0, parts.length-320);

    raf = requestAnimationFrame(loop);
  }

  function resize(){
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W*DPR; cv.height = H*DPR;
    cv.style.width = W+"px"; cv.style.height = H+"px";
    cx.setTransform(DPR,0,0,DPR,0,0);
    var want = REDUCED ? 0 : Math.min(46, Math.round(W*H/12000));
    bg = []; for(var i=0;i<want;i++) bg.push(new EnvParticle());
  }

  return {
    init: function(){
      cv = document.getElementById("fxCanvas");
      if(!cv) return;
      cx = cv.getContext("2d");
      REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      resize();
      window.addEventListener("resize", function(){ setTimeout(resize, 120); });
      running = true; lastT = performance.now();
      raf = requestAnimationFrame(loop);
    },
    /* 点击/答题成功的爆发 */
    burst: function(x, y, n, opt){
      opt = opt || {};
      n = n || 10;
      if(REDUCED) n = Math.min(n, 4);
      for(var i=0;i<n;i++){
        parts.push(new Particle(x, y, {
          speed: opt.speed || (3 + Math.random()*7),
          r: opt.r || (5 + Math.random()*8),
          lift: opt.lift !== undefined ? opt.lift : 3.2,
          grav: opt.grav !== undefined ? opt.grav : 0.17,
          decay: opt.decay || (0.010 + Math.random()*0.011),
          shape: opt.shape
        }));
      }
    },
    /* 从屏幕顶部飘落的庆祝雨 */
    rain: function(n){
      n = n || 30;
      if(REDUCED) n = Math.min(n, 8);
      for(var i=0;i<n;i++){
        var x = Math.random()*W, y = -30 - Math.random()*180;
        parts.push(new Particle(x, y, {
          speed: 1.2 + Math.random()*2.2,
          angle: Math.PI/2,
          lift: 0, grav: 0.05,
          decay: 0.0045,
          r: 6 + Math.random()*9,
          spin: 2.2
        }));
      }
    },
    ripple: ripple,
    resize: resize
  };
})();
