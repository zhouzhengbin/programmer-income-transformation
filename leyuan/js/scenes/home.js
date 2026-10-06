/* 首页：真实绘制的主视觉 + 粒子 + 开始按钮 */
(function (g) {
  'use strict';
  g.OMNI_SCENES = g.OMNI_SCENES || {};
  g.OMNI_SCENES.home = function (wrap, api) {
    wrap.innerHTML =
      '<div class="card" style="text-align:center;padding:18px">' +
        '<canvas id="heroCanvas" style="width:100%;height:min(46vh,340px);display:block;border-radius:14px"></canvas>' +
        '<h3 class="title" style="margin-top:14px">未来星学院</h3>' +
        '<p class="sub">玩游戏，学真本事：学科 · 科技 · 商业 · 生活 · 做人</p>' +
        '<button class="btn" id="startBtn">🚀 开始冒险</button>' +
        '<button class="btn ghost" id="continueBtn" style="margin-left:8px">📖 继续上次</button>' +
      '</div>' +
      '<div class="card">' +
        '<h3 class="title" style="font-size:19px">探索地图</h3>' +
        '<p class="sub">点击进入任意场景，边玩边学。</p>' +
        '<div class="grid" id="tileGrid"></div>' +
      '</div>';

    var grid = wrap.querySelector('#tileGrid');
    var meta = {
      learn: { t: '学科知识塔', d: '语文 · 数学 · 英语 · 科学 · 历史 · 地理', i: '📚' },
      tech:  { t: '未来科技舱', d: 'AI · 编程 · 区块链 · 量子 · 脑机 · 合成生物', i: '🛰️' },
      biz:   { t: '商业模拟城', d: '电商 · 订阅 · 平台 · 外贸 · 网络经济 · 免费增值', i: '💹' },
      life:  { t: '生活技能屋', d: '急救 · 时间 · 金钱 · 营养 · 安全 · 情绪', i: '🧭' },
      rules: { t: '做人法则碑', d: '诚信 · 尊重 · 责任 · 合作 · 长线 · 格局', i: '⚖️' }
    };
    Object.keys(meta).forEach(function (k) {
      var m = meta[k];
      var el = document.createElement('div');
      el.className = 'card tile';
      el.innerHTML = '<span class="tag">' + m.i + ' 领域</span><h5>' + m.t + '</h5><p>' + m.d + '</p>';
      el.onclick = function () { api.go(k); };
      grid.appendChild(el);
    });

    /* ===== 主视觉：星空 + 飞行器 + 主角小人 ===== */
    var cv = wrap.querySelector('#heroCanvas');
    var ctx = cv.getContext('2d');
    var W = 0, H = 0, dpr = window.devicePixelRatio || 1;
    function resize() {
      var r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    var ro = new ResizeObserver(resize); ro.observe(cv);

    var stars = [];
    for (var i = 0; i < 90; i++) stars.push({ x: Math.random(), y: Math.random(), s: Math.random() * 1.6 + .3, a: Math.random(), v: Math.random() * .0008 + .0003 });

    var t0 = performance.now();
    var raf;
    function draw(now) {
      raf = requestAnimationFrame(draw);
      var t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);

      var gr = ctx.createLinearGradient(0, 0, W, H);
      gr.addColorStop(0, '#0b1230'); gr.addColorStop(.5, '#131a44'); gr.addColorStop(1, '#0b1230');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);

      var halo = ctx.createRadialGradient(W * .5, H * .58, 10, W * .5, H * .58, Math.min(W, H) * .75);
      halo.addColorStop(0, 'rgba(94,231,255,.35)');
      halo.addColorStop(.5, 'rgba(179,136,255,.16)');
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);

      stars.forEach(function (s) {
        s.a += s.v * 16;
        if (s.a > 1) s.a = 0;
        ctx.globalAlpha = .25 + s.a * .75;
        ctx.fillStyle = '#dce9ff';
        ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.s, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      /* 星球 */
      var px = W * .30, py = H * .72, pr = Math.min(W, H) * .17;
      var pg = ctx.createRadialGradient(px - pr * .35, py - pr * .4, pr * .1, px, py, pr);
      pg.addColorStop(0, '#8ff0ff'); pg.addColorStop(.55, '#3c7cf0'); pg.addColorStop(1, '#122a63');
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(160,220,255,.35)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(px, py, pr * 1.5, pr * .42, -.32, 0, Math.PI * 2); ctx.stroke();

      /* 飞船 */
      var sx = W * .62 + Math.sin(t * .7) * 14;
      var sy = H * .40 + Math.cos(t * .9) * 8;
      ctx.save();
      ctx.translate(sx, sy); ctx.rotate(Math.sin(t * .6) * .12);
      var sg = ctx.createLinearGradient(-42, 0, 42, 0);
      sg.addColorStop(0, '#5ee7ff'); sg.addColorStop(.5, '#ffffff'); sg.addColorStop(1, '#b388ff');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(46, 0); ctx.lineTo(-22, -18); ctx.lineTo(-10, 0); ctx.lineTo(-22, 18); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = .55;
      var fl = 26 + Math.sin(t * 22) * 8;
      var fg = ctx.createLinearGradient(-10, 0, -10 - fl, 0);
      fg.addColorStop(0, 'rgba(255,209,102,.95)'); fg.addColorStop(1, 'rgba(255,209,102,0)');
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.moveTo(-10, -8); ctx.lineTo(-10 - fl, 0); ctx.lineTo(-10, 8); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1; ctx.restore();

      /* 主角：站在星球上的小孩 */
      var cx = px, cy = py - pr * 1.02;
      var bob = Math.sin(t * 2.2) * 2.4;
      cy += bob;
      /* 身体 */
      var bodyG = ctx.createLinearGradient(cx - 12, cy, cx + 12, cy + 26);
      bodyG.addColorStop(0, '#ffd166'); bodyG.addColorStop(1, '#ff9f5a');
      ctx.fillStyle = bodyG;
      ctx.beginPath();
      ctx.moveTo(cx - 11, cy + 24);
      ctx.quadraticCurveTo(cx, cy - 2, cx + 11, cy + 24);
      ctx.closePath(); ctx.fill();
      /* 手臂 */
      ctx.strokeStyle = '#ffcf7a'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - 9, cy + 10); ctx.lineTo(cx - 20, cy + 2 + Math.sin(t * 3) * 3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 9, cy + 10); ctx.lineTo(cx + 22, cy - 6 + Math.cos(t * 3) * 3); ctx.stroke();
      /* 头 */
      var hg = ctx.createRadialGradient(cx - 3, cy - 16, 1, cx, cy - 12, 12);
      hg.addColorStop(0, '#fff3d6'); hg.addColorStop(1, '#f6c98a');
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.arc(cx, cy - 12, 11, 0, Math.PI * 2); ctx.fill();
      /* 头发 */
      ctx.fillStyle = '#2a2440';
      ctx.beginPath(); ctx.arc(cx, cy - 15, 11.2, Math.PI * 1.02, Math.PI * 2.02); ctx.fill();
      /* 眼睛（眨眼） */
      var blink = (Math.sin(t * 1.7) > .985) ? .18 : 1;
      ctx.fillStyle = '#101830';
      ctx.beginPath(); ctx.ellipse(cx - 3.6, cy - 11, 1.5, 1.5 * blink, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 3.6, cy - 11, 1.5, 1.5 * blink, 0, 0, Math.PI * 2); ctx.fill();
      /* 微笑 */
      ctx.strokeStyle = '#c0764a'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(cx, cy - 7.5, 3.6, .18 * Math.PI, .82 * Math.PI); ctx.stroke();

      /* 星星点缀 */
      for (var k = 0; k < 6; k++) {
        var ang = t * .6 + k * Math.PI / 3;
        var rr = Math.min(W, H) * .30 + Math.sin(t * 1.4 + k) * 10;
        var xx = W * .5 + Math.cos(ang) * rr;
        var yy = H * .52 + Math.sin(ang) * rr * .55;
        ctx.globalAlpha = .55;
        ctx.fillStyle = k % 2 ? '#ffd166' : '#5ee7ff';
        ctx.beginPath(); ctx.arc(xx, yy, 2.2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    raf = requestAnimationFrame(draw);

    wrap.querySelector('#startBtn').onclick = function () {
      api.addXP(10, '开启旅程');
      api.go('biz');
    };
    wrap.querySelector('#continueBtn').onclick = function () {
      api.toast('已恢复进度：Lv.' + api.state.level + ' · ' + api.state.xp + ' XP');
      api.go('learn');
    };
  };
})(window);
