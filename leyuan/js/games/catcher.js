/* 接住掉落：拖动篮子接星星，碰到炸弹扣分。尺寸由 layout 驱动 */
(function (g) {
  'use strict';
  g.OMNI_GAMES = g.OMNI_GAMES || {};
  g.OMNI_GAMES.catcher = function (box, api) {
    box.innerHTML =
      '<div class="playWrap"><canvas class="play" id="cv"></canvas></div>' +
      '<div class="hint" id="hint">拖动篮子接住星星</div>';

    var cv = box.querySelector('#cv'), ctx = cv.getContext('2d');
    var W = 0, H = 0, SIDE = 0;
    var basketX = 0, targetX = 0, dragging = false;
    var drops = [], score = 0, lastSpawn = 0, t0 = performance.now();
    var raf = 0;

    function sizeCanvas() {
      if (g.OMNI_LAYOUT) { var m = g.OMNI_LAYOUT.get(); W = m.w; H = m.h; }
      else { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; }
      SIDE = Math.max(220, Math.min(W - 20, H - 130));
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = SIDE * dpr; cv.height = SIDE * dpr;
      cv.style.width = SIDE + 'px'; cv.style.height = SIDE + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!basketX) { basketX = SIDE / 2; targetX = SIDE / 2; }
    }

    function spawn() {
      var good = Math.random() > .25;
      drops.push({
        x: 28 + Math.random() * Math.max(1, SIDE - 56),
        y: -20, vy: 1.3 + Math.random() * 1.8,
        good: good, r: 12 + Math.random() * 8,
        phase: Math.random() * Math.PI * 2
      });
    }

    function loop() {
      raf = requestAnimationFrame(loop);
      var now = performance.now(), t = (now - t0) / 1000;
      if (now - lastSpawn > 640) { lastSpawn = now; spawn(); }
      basketX += (targetX - basketX) * 0.18;

      ctx.clearRect(0, 0, SIDE, SIDE);
      for (var k = 0; k < 16; k++) {
        ctx.globalAlpha = .2;
        ctx.fillStyle = '#ffc94d';
        ctx.beginPath();
        ctx.arc((k * 79 + t * 8) % SIDE, (k * 47) % SIDE, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      var bw = Math.max(70, SIDE * .22), bh = 22, by = SIDE - 48;
      for (var i = drops.length - 1; i >= 0; i--) {
        var d = drops[i];
        d.y += d.vy;
        if (d.good) {
          ctx.fillStyle = '#ffc94d';
          star(ctx, d.x, d.y, d.r, d.r * .45, 5, t * 2 + d.phase);
        } else {
          ctx.fillStyle = '#ff6b81';
          ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(d.x - d.r * .5, d.y - d.r * .5); ctx.lineTo(d.x + d.r * .5, d.y + d.r * .5);
          ctx.moveTo(d.x + d.r * .5, d.y - d.r * .5); ctx.lineTo(d.x - d.r * .5, d.y + d.r * .5);
          ctx.stroke();
        }
        if (d.y > by - d.r && d.y < by + bh && Math.abs(d.x - basketX) < bw / 2 + d.r * .5) {
          drops.splice(i, 1);
          var rect = cv.getBoundingClientRect();
          if (d.good) { score++; api.gain(2, rect.left + d.x, rect.top + d.y, '接到'); box.querySelector('#hint').textContent = '接到 ' + score + ' 颗'; }
          else { api.miss(); box.querySelector('#hint').textContent = '接到炸弹，小心！'; }
          continue;
        }
        if (d.y > SIDE + 40) { if (d.good) api.miss(); drops.splice(i, 1); }
      }

      ctx.save();
      var gr = ctx.createLinearGradient(basketX - bw / 2, by, basketX + bw / 2, by + bh);
      gr.addColorStop(0, '#66d4ff'); gr.addColorStop(1, '#ff7fb6');
      ctx.fillStyle = gr;
      roundRect(ctx, basketX - bw / 2, by, bw, bh, 10); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
    }
    loop();

    function pos(ev) { var r = cv.getBoundingClientRect(); return ev.clientX - r.left; }
    cv.addEventListener('pointerdown', function (ev) { dragging = true; targetX = pos(ev); });
    cv.addEventListener('pointermove', function (ev) { targetX = pos(ev); });
    cv.addEventListener('pointerup', function () { dragging = false; });
    cv.addEventListener('pointerleave', function () { dragging = false; });

    function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
    function star(c, cx, cy, R, r, n, rot) {
      c.beginPath();
      for (var i = 0; i < n * 2; i++) {
        var rad = i % 2 === 0 ? R : r;
        var a = rot + i * Math.PI / n - Math.PI / 2;
        var x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
        if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.closePath(); c.fill();
    }

    sizeCanvas();
    if (g.OMNI_LAYOUT) g.OMNI_LAYOUT.on(function () { sizeCanvas(); });
    window.addEventListener('resize', sizeCanvas, { passive: true });
  };
})(window);
