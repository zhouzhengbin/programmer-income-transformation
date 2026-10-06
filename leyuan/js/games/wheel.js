/* 幸运转盘：点击旋转，指针停在哪格得对应星星。尺寸由 layout 提供 */
(function (g) {
  'use strict';
  g.OMNI_GAMES = g.OMNI_GAMES || {};
  g.OMNI_GAMES.wheel = function (box, api) {
    box.innerHTML =
      '<div class="playWrap"><canvas class="play" id="cv"></canvas></div>' +
      '<div class="btns"><button id="spin">转！</button></div>' +
      '<div class="hint">转到哪个颜色，就得那份星</div>';

    var cv = box.querySelector('#cv'), ctx = cv.getContext('2d');
    var W = 0, H = 0;
    var slices = [
      { c: '#5ee7ff', n: 1 }, { c: '#b388ff', n: 2 }, { c: '#ffd166', n: 3 },
      { c: '#4ade80', n: 5 }, { c: '#ff6b81', n: 1 }, { c: '#f9a8d4', n: 2 }
    ];
    var ang = 0, spinning = false;

    function layout() {
      if (g.OMNI_LAYOUT) { var m = g.OMNI_LAYOUT.get(); W = m.w; H = m.h; }
      else { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; }
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      /* 画布正方形，尽可能占满可用空间 */
      var side = Math.max(180, Math.min(W - 24, H - 150));
      cv.width = side * dpr; cv.height = side * dpr;
      cv.style.width = side + 'px'; cv.style.height = side + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      var side = cv.width / Math.min(2, window.devicePixelRatio || 1);
      var cx = side / 2, cy = side / 2, R = side * .42;
      ctx.clearRect(0, 0, side, side);
      var seg = Math.PI * 2 / slices.length;
      for (var i = 0; i < slices.length; i++) {
        var a0 = ang + i * seg, a1 = a0 + seg;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a1); ctx.closePath();
        ctx.fillStyle = slices[i].c; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3; ctx.stroke();
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(a0 + seg / 2);
        ctx.fillStyle = '#123055'; ctx.font = 'bold ' + (R * .18) + 'px sans-serif';
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillText(slices[i].n + '★', R * .82, 0);
        ctx.restore();
      }
      ctx.beginPath(); ctx.arc(cx, cy, R * .2, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; ctx.fill();
      ctx.strokeStyle = '#ffc94d'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#123055'; ctx.font = 'bold ' + (R * .16) + 'px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('★', cx, cy);
      ctx.fillStyle = '#ff7fb6';
      ctx.beginPath();
      ctx.moveTo(cx, cy - R * 1.1);
      ctx.lineTo(cx - R * .1, cy - R * .9);
      ctx.lineTo(cx + R * .1, cy - R * .9);
      ctx.closePath(); ctx.fill();
    }

    box.querySelector('#spin').onclick = function () {
      if (spinning) return;
      spinning = true;
      var t0 = performance.now();
      var dur = 2200 + Math.random() * 800;
      var start = ang, target = ang + Math.PI * 2 * (3 + Math.random() * 2);
      var lastSfx = 0;
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur);
        var ease = 1 - Math.pow(1 - p, 3);
        ang = start + (target - start) * ease;
        draw();
        if (now - lastSfx > 90) { lastSfx = now; api.sfx && api.sfx.spin(); }
        if (p < 1) { requestAnimationFrame(step); return; }
        spinning = false;
        var seg = Math.PI * 2 / slices.length;
        var pointer = -Math.PI / 2;
        var k = Math.floor((((pointer - ang) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / seg);
        var s = slices[k];
        var r = cv.getBoundingClientRect();
        api.gain(s.n, r.left + r.width / 2, r.top + r.height / 2, '转盘');
      })(t0);
    };

    function redraw() { layout(); draw(); }
    redraw();
    if (g.OMNI_LAYOUT) g.OMNI_LAYOUT.on(function () { redraw(); });
    window.addEventListener('resize', redraw, { passive: true });
  };
})(window);
