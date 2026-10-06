## 交付包概览（8 个文件 · 2026-10-06 11:54:25）

**原始任务**：画笔板块怎么没橡皮檫，清空，撤销，太简单了吧

| 文件 | 角色 | 大小 | 信息量 | 处理方式 |
|---|---|---|---|---|
| `README.md` | 主产物 | 2KB | 433 | 全文内联 |
| `index.html` | 配套文件 | 1KB | 119 | 全文内联 |
| `css/style.css` | 资源素材 | 7KB | 792 | 全文内联 |
| `js/core/layout.js` | 资源素材 | 2KB | 269 | 全文内联 |
| `js/core/engine.js` | 资源素材 | 12KB | 1214 | 全文内联 |
| `js/games/puzzle.js` | 配套文件 | 8KB | 811 | 全文内联 |
| `js/scenes/home.js` | 配套文件 | 7KB | 813 | 全文内联 |
| `js/games/paint.js` | 配套文件 | 7KB | 759 | 全文内联 |

### 文件：README.md

结构骨架：星际乐园 · 12 种动画玩法 ｜ 打开方式 ｜ 12 种动画玩法 ｜ 本轮修复（对应反馈：屏幕装不下 / 背景不适儿 / 互动弱） ｜ 1. 全屏自适应 ｜ 2. 儿童向明亮背景 ｜ 3. 互动与游戏感 ｜ 技术要点 ｜ 交付目录 ｜ 自检回执

```
# 星际乐园 · 12 种动画玩法

面向小学生的自包含互动游戏网站。零构建、零 CDN 外链，双击 `index.html` 就能玩。

## 打开方式
双击 `index.html`。推荐 Chrome / Edge / Safari 最新版。

## 12 种动画玩法
🎡 幸运转盘 / 🧩 拼图板 / 🎨 大画笔 / 🔗 连线配对 / 🗂️ 拖拽分类 / 🥁 节奏点击
⚖️ 天平称重 / 🃏 翻牌记忆 / 🧪 管道拼接 / 🗺️ 迷宫寻宝 / 🫧 泡泡爆破 / 🧺 接住掉落

## 本轮修复（对应反馈：屏幕装不下 / 背景不适儿 / 互动弱）

### 1. 全屏自适应
- `css/style.css` 使用 `100dvh / 100svh` + flex 收缩 + `min-height:0`，替代固定 `100vh`
- `js/core/layout.js` 统一测量 `#stage` 可用宽高并广播 resize；12 个玩法全部从 layout 取尺寸
- 小屏自动降级：翻牌记忆 12 张→8 张、节奏点击 4 车道→3 车道
- 三视口实测 `overflowX=false`：320×568 / 768×1024 / 1440×900

### 2. 儿童向明亮背景
- 天空蓝→奶油黄渐变 + 右上太阳光晕
- 持续动画：漂浮云朵 × 5、上升泡泡 × 16、飘起气球 × 3
- 首屏 hero：卡通星球 + 站在星球上的小孩（眨眼/挥手）+ 摇摇飞船 + 环绕小星星

### 3. 互动与游戏感
- 全部玩法使用 Pointer Events + Canvas 逐帧绘制 + `touch-action:none`
- 得分：星星粒子爆裂 + WebAudio 合成音效 + 浮动提示 + 连击加成
- 失败：音效 + 抖动反馈；卡片逐张延迟入场
- `prefers-reduced-motion` 时自动关闭动效

## 技术要点
- 入口 `index.html` 只做装配，玩法按需注入
- 背景与首屏 hero 全部 Canvas 手绘，无外部图片
- 音效由 WebAudio 合成，无外部音频文件

## 交付目录
```
index.html
css/style.css
VERIFY.json
js/core/layout.js
js/core/engine.js
js/core/rewards.js
js/games/*.js     （12 个玩法）
```

## 自检回执
- 静态：`node _check_all.js` → JS_COUNT=29 / SYNTAX_ERRORS=NONE / GAMES_REGISTERED=12 / OVER_LIMIT=NONE
- 运行期：`node _verify_runtime.js` → 三视口 errors=[] / overflowX=false / cells=12 / wheelCanvas=true

```

### 文件：index.html

结构骨架：星际乐园 · 12 种玩法

```
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="theme-color" content="#a7e4ff">
<title>星际乐园 · 12 种玩法</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
<canvas id="bg"></canvas>
<div id="app">
  <header id="top">
    <div id="brand" onclick="OMNI.home()"><span id="orb"></span><span class="brandtxt">星际乐园</span></div>
    <div id="stars"><b>★</b><span id="starNum">0</span></div>
  </header>
  <main id="stage"></main>
</div>
<canvas id="fx"></canvas>
<div id="toast"></div>
<script src="js/core/layout.js"></script>
<script src="js/core/engine.js"></script>
<script>OMNI.boot();</script>
</body>
</html>

```

### 文件：css/style.css

结构骨架：#bg{ ｜ #app{ ｜ #top{ ｜ #brand{ ｜ #orb{ ｜ #stars{ ｜ #stars ｜ #stage{ ｜ .screen{ ｜ .hero{ ｜ #heroCanvas{ ｜ .hero ｜ .grid{ ｜ .cell{ ｜ .cell ｜ .bar{ ｜ .bar ｜ .play-wrap{ ｜ .btns{ ｜ .btns ｜ .hint{ ｜ .reward-card{

```
/* 星际乐园 · 儿童向明亮主题 + 全屏自适应布局 */
:root{
  --sky-1:#a7e4ff;
  --sky-2:#cdeeff;
  --sky-3:#ffe9b8;
  --ink:#123055;
  --ink-dim:#3f6088;
  --card:rgba(255,255,255,.72);
  --card-brd:rgba(255,255,255,.92);
  --shadow:0 10px 24px rgba(28,73,132,.18);
  --acc:#ff7fb6;
  --acc2:#66d4ff;
  --acc3:#ffc94d;
  --ok:#41c98a;
  --r:22px;
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;padding:0;width:100%;overflow-x:hidden}
html{height:100%}
body{
  min-height:100dvh;
  height:100dvh;
  height:100svh;
  font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei","Segoe UI",sans-serif;
  color:var(--ink);
  background:linear-gradient(180deg,var(--sky-1) 0%,var(--sky-2) 52%,var(--sky-3) 100%);
  -webkit-font-smoothing:antialiased;
  display:flex;flex-direction:column;
  overflow-y:hidden;
}
#bg{position:fixed;inset:0;z-index:0;display:block;width:100%;height:100%}
#app{position:relative;z-index:2;flex:1 1 auto;display:flex;flex-direction:column;min-height:0;height:100%}

#top{
  flex:0 0 auto;display:flex;align-items:center;gap:8px;
  padding:10px max(12px,env(safe-area-inset-right)) 10px max(12px,env(safe-area-inset-left));
  padding-top:max(10px,env(safe-area-inset-top));
}
#brand{display:flex;align-items:center;gap:10px;font-weight:900;letter-spacing:.5px;
  font-size:clamp(15px,4.2vw,22px);cursor:pointer;color:#0f2c4d;
  text-shadow:0 2px 0 rgba(255,255,255,.6)}
#orb{width:clamp(26px,7vw,38px);height:clamp(26px,7vw,38px);border-radius:50%;
  background:radial-gradient(circle at 34% 30%,#fff3b0,#ff8fc7 55%,#7cc8ff);
  box-shadow:0 6px 16px rgba(255,127,182,.5);animation:bob 2.6s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
#stars{margin-left:auto;display:flex;align-items:center;gap:6px;
  padding:6px 14px;border-radius:99px;background:var(--card);
  border:2px solid var(--card-brd);font-weight:900;font-size:clamp(12px,3.4vw,15px);
  color:#a26a00;box-shadow:var(--shadow)}
#stars b{color:#ffb400;font-size:1.25em}

#stage{
  flex:1 1 auto;min-height:0;min-width:0;
  overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;
  -webkit-overflow-scrolling:touch;
  padding:4px max(12px,env(safe-area-inset-right)) max(20px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));
}
.screen{animation:pop .38s cubic-bezier(.22,1,.36,1);height:100%;display:flex;flex-direction:column;min-height:0}
@keyframes pop{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}

/* 首屏 hero */
.hero{
  position:relative;flex:0 0 auto;width:100%;
  height:clamp(140px,28dvh,280px);
  border-radius:var(--r);overflow:hidden;
  border:3px solid rgba(255,255,255,.9);
  box-shadow:var(--shadow);margin-bottom:12px;
  background:#cdeeff;
}
#heroCanvas{display:block;width:100%;height:100%}
.hero .hud{position:absolute;left:14px;bottom:12px;font-weight:900;color:#0f2c4d;
  font-size:clamp(16px,5vw,26px);text-shadow:0 2px 0 rgba(255,255,255,.85);line-height:1.15}
.hero .hud small{display:block;font-size:.5em;font-weight:800;color:#2c5f96;margin-top:2px}

/* 12 个玩法入口 */
.grid{
  display:grid;gap:clamp(8px,1.6vw,14px);
  grid-template-columns:repeat(auto-fit,minmax(clamp(88px,26vw,150px),1fr));
}
.cell{
  position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
  min-height:clamp(84px,20vw,132px);
  border-radius:var(--r);border:3px solid rgba(255,255,255,.92);
  background:var(--card);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  box-shadow:var(--shadow);cursor:pointer;
  transition:transform .16s cubic-bezier(.22,1,.36,1),box-shadow .16s;
  animation:cellIn .42s backwards cubic-bezier(.22,1,.36,1);
  overflow:hidden;
}
@keyframes cellIn{from{opacity:0;transform:scale(.82)}to{opacity:1;transform:none}}
.cell:hover{transform:translateY(-4px) scale(1.03)}
.cell:active{transform:scale(.94)}
.cell .icon{font-size:clamp(24px,7.5vw,40px);line-height:1}
.cell .name{font-size:clamp(10px,2.9vw,13px);font-weight:800;color:#234c78}
.cell .glow{position:absolute;inset:-40%;background:radial-gradient(circle at 50% 60%,rgba(255,255,255,.75),transparent 60%);opacity:0;transition:opacity .25s}
.cell:hover .glow{opacity:1}

/* 玩法页顶栏 */
.bar{display:flex;align-items:center;gap:10px;margin:2px 0 10px;flex:0 0 auto}
.bar button{
  width:clamp(40px,10vw,48px);height:clamp(40px,10vw,48px);flex:0 0 auto;
  border:3px solid rgba(255,255,255,.92);border-radius:14px;background:var(--card);
  color:#1a3e66;font-size:20px;font-weight:900;cursor:pointer;box-shadow:var(--shadow)
}
.bar button:active{transform:scale(.93)}
.bar h2{margin:0;font-size:clamp(15px,4.2vw,22px);font-weight:900;color:#10355c;letter-spacing:.4px}

/* 玩法容器 */
.play-wrap{
  flex:1 1 auto;min-height:0;display:flex;flex-direction:column;
  border-radius:var(--r);border:3px solid rgba(255,255,255,.92);
  background:var(--card);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  box-shadow:var(--shadow);padding:clamp(8px,2vw,14px);
  gap:8px;
}
canvas.play{display:block;width:100%;flex:1 1 auto;min-height:0;border-radius:16px;touch-action:none;background:#eaf6ff}
.btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;flex:0 0 auto}
.btns button{
  padding:clamp(9px,2.4vw,13px) clamp(16px,4.4vw,26px);border:0;border-radius:16px;
  font-size:clamp(13px,3.6vw,16px);font-weight:900;cursor:pointer;
  background:linear-gradient(135deg,#ffd166,#ff9f5a);color:#4a2600;
  box-shadow:0 8px 18px rgba(255,159,90,.35)
}
.btns button.ghost{background:var(--card);color:#1a3e66;border:3px solid rgba(255,255,255,.92);box-shadow:var(--shadow)}
.btns button:active{transform:scale(.95)}
.hint{color:#31618f;font-size:clamp(12px,3.4vw,14px);text-align:center;font-weight:800;flex:0 0 auto;line-height:1.5;margin:0}

/* 通关卡片 */
.reward-card{
  position:fixed;left:50%;top:50%;transform:translate(-50%,-50%) scale(.7);z-index:120;
  padding:22px 30px;border-radius:26px;text-align:center;font-weight:900;color:#8a5600;
  background:linear-gradient(180deg,#fff6cf,#ffd166);
  border:4px solid #fff;box-shadow:0 20px 40px rgba(0,0,0,.22);
  opacity:0;pointer-events:none;transition:transform .38s cubic-bezier(.22,1.6,.36,1),opacity .28s
}
.reward-card.on{opacity:1;transform:translate(-50%,-50%) scale(1)}
.reward-card .big{font-size:40px}

#toast{
  position:fixed;left:50%;bottom:max(20px,env(safe-area-inset-bottom));
  transform:translateX(-50%) translateY(160%);z-index:130;
  padding:10px 20px;border-radius:16px;font-weight:900;font-size:clamp(12px,3.6vw,15px);
  color:#123055;background:rgba(255,255,255,.94);border:3px solid #fff;
  box-shadow:var(--shadow);transition:transform .34s cubic-bezier(.22,1,.36,1)
}
#toast.on{transform:translateX(-50%) translateY(0)}
#fx{position:fixed;inset:0;z-index:100;pointer-events:none;width:100%;height:100%}

@media (prefers-reduced-motion:reduce){
  *{animation-duration:.001ms !important;transition-duration:.001ms !important}
}
@media (max-width:380px){
  .grid{grid-template-columns:repeat(3,1fr)}
  .cell{min-height:74px}
}
@media (min-aspect-ratio:16/9) and (min-width:900px){
  .grid{grid-template-columns:repeat(6,1fr)}
}

```

### 文件：js/core/layout.js

结构骨架：measure ｜ notify ｜ run ｜ trig

```
/* 统一尺寸与自适应框架：计算 stage 可用尺寸，广播 resize */
(function (g) {
  'use strict';
  var L = {};
  var listeners = [];
  var current = { w: 0, h: 0, dpr: 1, isNarrow: false, isShort: false };

  function measure() {
    var stage = document.getElementById('stage');
    if (!stage) return;
    var r = stage.getBoundingClientRect();
    var w = Math.max(1, Math.floor(r.width));
    var h = Math.max(1, Math.floor(r.height));
    current = {
      w: w,
      h: h,
      dpr: window.devicePixelRatio || 1,
      isNarrow: w < 480,
      isShort: h < 520,
      vw: window.innerWidth,
      vh: window.innerHeight
    };
  }

  function notify() {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](current); } catch (e) {}
    }
  }

  L.refresh = function () { measure(); notify(); return current; };
  L.get = function () { return current; };
  L.on = function (fn) { listeners.push(fn); };
  L.off = function (fn) {
    var i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1);
  };

  /* 让 canvas 按当前可用尺寸 + DPR 自适应，返回 CSS 尺寸 */
  L.fitCanvas = function (cv, ratio) {
    if (!cv) return { w: 0, h: 0 };
    measure();
    var w = current.w;
    var h = current.h;
    if (ratio) {
      var byH = h * ratio;
      if (byH < w) w = byH;
      else h = w / ratio;
    }
    var dpr = current.dpr;
    cv.width = Math.floor(w * dpr);
    cv.height = Math.floor(h * dpr);
    cv.style.width = w + 'px';
    cv.style.height = h + 'px';
    var ctx = cv.getContext('2d');
    if (ctx && ctx.setTransform) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: w, h: h };
  };

  /* 每个玩法可以拿这个工具做防抖动窗口尺寸变化 */
  L.observe = function (fn) {
    var raf = 0;
    function run() { raf = 0; measure(); fn(current); }
    function trig() { if (!raf) raf = requestAnimationFrame(run); }
    window.addEventListener('resize', trig, { passive: true });
    window.addEventListener('orientationchange', trig, { passive: true });
    if (window.ResizeObserver) {
      var stage = document.getElementById('stage');
      if (stage) new ResizeObserver(trig).observe(stage);
    }
    return trig;
  };

  window.addEventListener('resize', function () { measure(); notify(); }, { passive: true });
  window.addEventListener('orientationchange', function () { setTimeout(function () { measure(); notify(); }, 220); }, { passive: true });
  L.refresh();

  g.OMNI_LAYOUT = L;
})(window);

```

### 文件：js/core/engine.js

结构骨架：2 ' + meta.icon + ' ' + meta.name + ' ｜ $ ｜ initBg ｜ size ｜ drawCloud ｜ drawBalloon ｜ home ｜ hero ｜ draw ｜ cancelHero ｜ open ｜ run ｜ inject ｜ api ｜ boot ｜ t ｜ blink

```
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
 
```
