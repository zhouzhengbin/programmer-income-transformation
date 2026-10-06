/* 星际乐园 · 引擎：12 个动画玩法 / 儿童向明亮背景 / 按需加载 / 尺寸自适应 */
(function (global) {
  'use strict';

  var GAMES = [
    { id: 'wheel',   name: '幸运转盘', icon: '🎡', src: 'js/games/wheel.js' },
    { id: 'puzzle',  name: '拼图板',   icon: '🧩', src: 'js/games/puzzle.js' },
    { id: 'paint',   name: '大画笔',   icon: '🎨', src: 'js/games/paint.js' },
    { id: 'link',    name: '连线配对', icon: '🔗', src: 'js/games/link.js' },
    { id: 'sort',    name: '拖拽分类', icon: '🗂️', src: 'js/games/sort.js' },
    { id: 'rhythm',  name: '节奏点击', icon: '🥁', src: 'js/games/rhythm.js' },
    { id: 'balance', name: '天平称重', icon: '⚖️', src: 'js/games/balance.js' },
    { id: 'memory',  name: '翻牌记忆', icon: '🃏', src: 'js/games/memory.js' },
    { id: 'pipe',    name: '管道拼接', icon: '🧪', src: 'js/games/pipe.js' },
    { id: 'maze',    name: '迷宫寻宝', icon: '🗺️', src: 'js/games/maze.js' },
    { id: 'bubble',  name: '泡泡爆破', icon: '🫧', src: 'js/games/bubble.js' },
    { id: 'catcher', name: '接住掉落', icon: '🧺', src: 'js/games/catcher.js' }
  ];

  var loaded = {};
  var stage = null;
  var heroRaf = 0;

  function $(id) { return document.getElementById(id); }

  /* ===== 背景：明亮糖果色 + 云朵 + 泡泡 + 气球 ===== */
  function initBg() {
    var c = $('bg'); if (!c) return;
    var ctx = c.getContext('2d');
    var W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
    function size() {
      W = window.innerWidth; H = window.innerHeight;
      c.width = Math.floor(W * dpr); c.height = Math.floor(H * dpr);
      c.style.width = W + 'px'; c.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener('resize', size, { passive: true });

    var clouds = [];
    for (var i = 0; i < 5; i++) clouds.push({ x: Math.random() * W, y: 40 + Math.random() * (H * .5), s: .6 + Math.random() * .8, v: .12 + Math.random() * .18 });
    var bubbles = [];
    for (var j = 0; j < 16; j++) bubbles.push({ x: Math.random() * W, y: Math.random() * H, r: 6 + Math.random() * 16, v: .35 + Math.random() * .7, a: .25 + Math.random() * .35, hue: Math.floor(Math.random() * 360) });
    var balloons = [];
    for (var k = 0; k < 3; k++) balloons.push({ x: 60 + Math.random() * (W - 120), y: H + 80 + k * 120, s: .8 + Math.random() * .5, hue: [340, 200, 40][k], v: .28 + Math.random() * .18, sway: Math.random() * Math.PI * 2 });

    var t = 0;
    (function loop() {
      requestAnimationFrame(loop);
      t += 1;
      var g1 = ctx.createLinearGradient(0, 0, 0, H);
      g1.addColorStop(0, '#a7e4ff'); g1.addColorStop(.55, '#cdeeff'); g1.addColorStop(1, '#ffe9b8');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
      /* 太阳光晕 */
      var sunX = W * .85, sunY = H * .14;
      var g2 = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, Math.min(W, H) * .5);
      g2.addColorStop(0, 'rgba(255, 240, 170, .85)');
      g2.addColorStop(.5, 'rgba(255, 240, 170, .18)');
      g2.addColorStop(1, 'rgba(255,240,170,0)');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
      /* 云朵 */
      clouds.forEach(function (cl) {
        cl.x += cl.v; if (cl.x > W + 120) cl.x = -120;
        drawCloud(ctx, cl.x, cl.y, cl.s);
      });
      /* 泡泡 */
      bubbles.forEach(function (b) {
        b.y -= b.v;
        if (b.y < -20) { b.y = H + 20; b.x = Math.random() * W; }
        var gg = ctx.createRadialGradient(b.x - b.r * .3, b.y - b.r * .35, b.r * .2, b.x, b.y, b.r);
        gg.addColorStop(0, 'rgba(255,255,255,.9)');
        gg.addColorStop(.6, 'hsla(' + b.hue + ',90%,72%,' + b.a + ')');
        gg.addColorStop(1, 'hsla(' + b.hue + ',90%,72%,0)');
        ctx.fillStyle = gg;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      });
      /* 气球 */
      balloons.forEach(function (bl) {
        bl.y -= bl.v;
        bl.sway += .02;
        var x = bl.x + Math.sin(bl.sway) * 14;
        if (bl.y < -140) { bl.y = H + 160; bl.x = 60 + Math.random() * (W - 120); }
        drawBalloon(ctx, x, bl.y, bl.s, bl.hue);
      });
      global.__omniTick = t;
    })();

    function drawCloud(c2, x, y, s) {
      c2.save(); c2.translate(x, y); c2.scale(s, s);
      c2.fillStyle = 'rgba(255,255,255,.92)';
      c2.beginPath();
      c2.arc(0, 0, 26, 0, Math.PI * 2);
      c2.arc(26, 6, 20, 0, Math.PI * 2);
      c2.arc(-26, 6, 18, 0, Math.PI * 2);
      c2.arc(8, -14, 18, 0, Math.PI * 2);
      c2.fill();
      c2.restore();
    }
    function drawBalloon(c2, x, y, s, hue) {
      c2.save(); c2.translate(x, y); c2.scale(s, s);
      c2.strokeStyle = 'rgba(255,255,255,.85)'; c2.lineWidth = 1.5;
      c2.beginPath(); c2.moveTo(0, 40); c2.quadraticCurveTo(8, 56, 0, 70); c2.stroke();
      var gg = c2.createRadialGradient(-8, -14, 4, 0, 0, 32);
      gg.addColorStop(0, 'rgba(255,255,255,.95)');
      gg.addColorStop(.5, 'hsla(' + hue + ',90%,70%,1)');
      gg.addColorStop(1, 'hsla(' + hue + ',80%,55%,1)');
      c2.fillStyle = gg;
      c2.beginPath(); c2.ellipse(0, 0, 26, 32, 0, 0, Math.PI * 2); c2.fill();
      c2.beginPath(); c2.moveTo(-6, 30); c2.lineTo(0, 40); c2.lineTo(6, 30); c2.closePath();
      c2.fillStyle = 'hsla(' + hue + ',80%,55%,1)'; c2.fill();
      c2.restore();
    }
  }

  /* ===== 首屏 ===== */
  function home() {
    cancelHero();
    stage.innerHTML =
      '<div class="screen">' +
        '<div class="hero"><canvas id="heroCanvas"></canvas><div class="hud">星际乐园<small>选一个开始玩</small></div></div>' +
        '<div class="grid" id="grid"></div>' +
      '</div>';
    var grid = $('grid');
    GAMES.forEach(function (gm, i) {
      var el = document.createElement('div');
      el.className = 'cell';
      el.style.animationDelay = (i * 40) + 'ms';
      el.innerHTML = '<div class="glow"></div><div class="icon">' + gm.icon + '</div><div class="name">' + gm.name + '</div>';
      el.onclick = function () { open(gm.id); };
      grid.appendChild(el);
    });
    hero();
    requestAnimationFrame(function () {
      if (global.OMNI_LAYOUT) global.OMNI_LAYOUT.refresh();
    });
  }

  function hero() {
    var cv = $('heroCanvas'); if (!cv) return;
    var ctx = cv.getContext('2d');
    var W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
    function size() {
      var r = cv.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      cv.width = Math.floor(W * dpr); cv.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener('resize', size, { passive: true });
    var t0 = performance.now();
    function draw(now) {
      heroRaf = requestAnimationFrame(draw);
      var t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      /* 明亮渐变 */
      var g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#ffe9f3'); g.addColorStop(.5, '#e6f4ff'); g.addColorStop(1, '#fff6d9');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      /* 卡通星球 */
      var px = W * .3, py = H * .78, pr = Math.min(W, H) * .2;
      var pg = ctx.createRadialGradient(px - pr * .35, py - pr * .4, pr * .1, px, py, pr);
      pg.addColorStop(0, '#b7f0ff'); pg.addColorStop(.6, '#7cc8ff'); pg.addColorStop(1, '#5aa8ff');
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.65)';
      ctx.beginPath(); ctx.arc(px - pr * .3, py - pr * .35, pr * .22, 0, Math.PI * 2); ctx.fill();
      /* 站在星球上的小孩 */
      var cx = px, cy = py - pr * 1.08 + Math.sin(t * 2) * 2.2;
      ctx.fillStyle = '#ff7fb6';
      ctx.beginPath(); ctx.moveTo(cx - 14, cy + 28); ctx.quadraticCurveTo(cx, cy - 4, cx + 14, cy + 28); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#ffb3d1'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - 11, cy + 12); ctx.lineTo(cx - 23, cy + 2 + Math.sin(t * 3) * 3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 11, cy + 12); ctx.lineTo(cx + 25, cy - 8 + Math.cos(t * 3) * 3); ctx.stroke();
      var hg = ctx.createRadialGradient(cx - 3, cy - 18, 1, cx, cy - 14, 13);
      hg.addColorStop(0, '#fff3d6'); hg.addColorStop(1, '#f6c98a');
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cx, cy - 14, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6b4b2a';
      ctx.beginPath(); ctx.arc(cx, cy - 17, 12.2, Math.PI * 1.02, Math.PI * 2.02); ctx.fill();
      var blink = (Math.sin(t * 1.7) > .985) ? .18 : 1;
      ctx.fillStyle = '#2b2b40';
      ctx.beginPath(); ctx.ellipse(cx - 4, cy - 13, 1.7, 1.7 * blink, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 4, cy - 13, 1.7, 1.7 * blink, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#c0764a'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy - 8.5, 4, .18 * Math.PI, .82 * Math.PI); ctx.stroke();
      /* 摇摇飞船 */
      var sx = W * .72 + Math.sin(t * .7) * 12, sy = H * .32 + Math.cos(t * .9) * 8;
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(Math.sin(t * .6) * .12);
      ctx.fillStyle = '#ffd166';
      ctx.beginPath(); ctx.moveTo(38, 0); ctx.lineTo(-18, -14); ctx.lineTo(-8, 0); ctx.lineTo(-18, 14); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5aa8ff';
      ctx.beginPath(); ctx.arc(2, 0, 6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      /* 环绕的小星星 */
      for (var k = 0; k < 6; k++) {
        var ang = t * .6 + k * Math.PI / 3;
        var rr = Math.min(W, H) * .34 + Math.sin(t * 1.4 + k) * 10;
        var xx = W * .5 + Math.cos(ang) * rr, yy = H * .5 + Math.sin(ang) * rr * .55;
        ctx.globalAlpha = .85;
        ctx.fillStyle = k % 2 ? '#ffc94d' : '#ff7fb6';
        ctx.beginPath(); ctx.arc(xx, yy, 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    heroRaf = requestAnimationFrame(draw);
  }

  function cancelHero() { if (heroRaf) { cancelAnimationFrame(heroRaf); heroRaf = 0; } }

  /* ===== 进入游戏 ===== */
  function open(id) {
    var meta = GAMES.filter(function (g2) { return g2.id === id; })[0];
    if (!meta) return;
    cancelHero();
    stage.innerHTML =
      '<div class="screen screen--play">' +
        '<div class="bar"><button id="backBtn" aria-label="返回">←</button><h2>' + meta.icon + ' ' + meta.name + '</h2></div>' +
        '<div class="panel" id="gameBox"></div>' +
      '</div>';
    $('backBtn').onclick = home;
    var box = $('gameBox');
    function run() {
      var fn = global.OMNI_GAMES && global.OMNI_GAMES[id];
      if (!fn) { box.innerHTML = '<div class="hint">玩法未就绪</div>'; return; }
      box.innerHTML = '';
      try { fn(box, api()); } catch (e) { box.innerHTML = '<div class="hint">玩法异常：' + (e && e.message) + '</div>'; }
      if (global.OMNI_LAYOUT) global.OMNI_LAYOUT.refresh();
    }
    if (loaded[id]) { run(); return; }
    box.innerHTML = '<div class="hint">载入中…</div>';
    inject(meta.src).then(function () { loaded[id] = true; run(); })
      .catch(function () { box.innerHTML = '<div class="hint">载入失败</div>'; });
  }

  function inject(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = function () { res(); }; s.onerror = function () { rej(new Error(src)); };
      document.head.appendChild(s);
    });
  }

  function api() {
    return {
      home: home,
      layout: global.OMNI_LAYOUT,
      reward: global.OMNI_REWARD,
      gain: function (n, x, y, label) { global.OMNI_REWARD && global.OMNI_REWARD.gain(n, x, y, label); },
      miss: function () { global.OMNI_REWARD && global.OMNI_REWARD.miss(); },
      toast: function (m) { global.OMNI_REWARD && global.OMNI_REWARD.toast(m); },
      burst: function (x, y) { global.OMNI_REWARD && global.OMNI_REWARD.burst(x, y); },
      sfx: global.OMNI_REWARD && global.OMNI_REWARD.sfx
    };
  }

  function boot() {
    stage = $('stage');
    initBg();
    inject('js/core/rewards.js').then(function () {
      if (global.OMNI_REWARD) global.OMNI_REWARD.init();
      home();
    }).catch(function () { home(); });
  }

  global.OMNI = { boot: boot, home: home, open: open, games: GAMES, api: api };
  global.OMNI_GAMES = global.OMNI_GAMES || {};
})(window);
