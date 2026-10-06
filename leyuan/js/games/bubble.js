/* 玩法 3：泡泡爆破 —— 点破同色泡泡，连击越多分越高 */
(function (g) {
  'use strict';
  g.OMNI_GAMES = g.OMNI_GAMES || {};
  g.OMNI_GAMES.bubble = function (box, api) {
    box.innerHTML =
      '<canvas class="play" id="cv" style="flex:1 1 auto;width:100%;cursor:crosshair"></canvas>' +
      '<div class="hint" id="hint">点破泡泡，连击越多星越多</div>';

    var cv = box.querySelector('#cv'), ctx = cv.getContext('2d');
    var dpr = devicePixelRatio || 1;
    var W = 0, H = 0;
    var bubbles = [];
    var combo = 0, popped = 0, t0 = performance.now(), running = true;
    var COLORS = ['#5ee7ff', '#b388ff', '#ffd166', '#4ade80', '#ff6b81', '#f9a8d4'];

    function size() {
      var r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size(); addEventListener('resize', size);

    function spawn() {
      var R = 18 + Math.random() * 24;
      bubbles.push({
        x: R + Math.random() * Math.max(1, W - R * 2),
        y: H + R,
        vx: (Math.random() - .5) * .6,
        vy: -(0.6 + Math.random() * 1.2),
        r: R,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        alive: true,
        phase: Math.random() * Math.PI * 2
      });
    }

    for (var i = 0; i < 8; i++) { spawn(); bubbles[i].y = Math.random() * H; }

    function loop() {
      if (!running) return;
      requestAnimationFrame(loop);
      var t = (performance.now() - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      /* 背景漂浮光点 */
      for (var k = 0; k < 24; k++) {
        var px = (k * 97 + t * 12) % W;
        var py = (k * 53 + t * 22) % H;
        ctx.globalAlpha = .18;
        ctx.fillStyle = COLORS[k % COLORS.length];
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (t % 0.6 < 0.02 && bubbles.length < 22) spawn();
      for (var i = bubbles.length - 1; i >= 0; i--) {
        var b = bubbles[i];
        b.x += b.vx + Math.sin(t * 2 + b.phase) * .35;
        b.y += b.vy;
        if (b.y < -b.r * 1.5) { bubbles.splice(i, 1); continue; }
        var grd = ctx.createRadialGradient(b.x - b.r * .3, b.y - b.r * .35, b.r * .15, b.x, b.y, b.r);
        grd.addColorStop(0, 'rgba(255,255,255,.9)');
        grd.addColorStop(.55, b.c);
        grd.addColorStop(1, 'rgba(10,15,42,.6)');
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.5; ctx.stroke();
      }
    }
    loop();

    cv.addEventListener('pointerdown', function (ev) {
      var rect = cv.getBoundingClientRect();
      var px = ev.clientX - rect.left, py = ev.clientY - rect.top;
      for (var i = bubbles.length - 1; i >= 0; i--) {
        var b = bubbles[i];
        var dx = px - b.x, dy = py - b.y;
        if (dx * dx + dy * dy <= b.r * b.r) {
          bubbles.splice(i, 1);
          popped++;
          var gain = 1 + Math.min(4, Math.floor(combo / 3));
          api.gain(gain, ev.clientX, ev.clientY, '泡泡');
          combo++;
          box.querySelector('#hint').textContent = '破了 ' + popped + ' 个 · 连击 ' + combo;
          return;
        }
      }
      combo = 0;
      api.miss();
    });
  };
})(window);
