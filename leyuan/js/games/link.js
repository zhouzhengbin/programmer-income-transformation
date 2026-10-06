/* 连线配对：左点一个右点一个，画贝塞尔曲线。尺寸由 layout 驱动 */
(function (g) {
  'use strict';
  g.OMNI_GAMES = g.OMNI_GAMES || {};
  g.OMNI_GAMES.link = function (box, api) {
    box.innerHTML =
      '<div class="playWrap"><canvas class="play" id="cv"></canvas></div>' +
      '<div class="hint" id="hint">左边点一个，右边点一个</div>';

    var cv = box.querySelector('#cv'), ctx = cv.getContext('2d');
    var W = 0, H = 0, SIDE = 0;
    var pairs = [
      { a: '🌞', b: '阳光' },
      { a: '🐟', b: '水' },
      { a: '🌳', b: '土壤' },
      { a: '🐦', b: '天空' }
    ];
    var left = [], right = [], sel = null, done = 0, lines = [], geo = {};

    function shuffle(arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }

    function sizeCanvas() {
      if (g.OMNI_LAYOUT) { var m = g.OMNI_LAYOUT.get(); W = m.w; H = m.h; }
      else { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; }
      SIDE = Math.max(220, Math.min(W - 20, H - 130));
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = SIDE * dpr; cv.height = SIDE * dpr;
      cv.style.width = SIDE + 'px'; cv.style.height = SIDE + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
    }

    function layout() {
      var pad = SIDE * .05;
      var rw = Math.min(120, SIDE * .3), rh = 56;
      var gap = (SIDE - rh * 4 - pad * 2) / 3;
      geo.left = left.map(function (_, i) { return { x: pad, y: pad + i * (rh + gap), w: rw, h: rh }; });
      geo.right = right.map(function (_, i) { return { x: SIDE - pad - rw, y: pad + i * (rh + gap), w: rw, h: rh }; });
    }

    function newRound() {
      sizeCanvas();
      left = shuffle(pairs.map(function (p, i) { return { text: p.a, key: i }; }));
      right = shuffle(pairs.map(function (p, i) { return { text: p.b, key: i }; }));
      sel = null; done = 0; lines = [];
      box.querySelector('#hint').textContent = '左边点一个，右边点一个';
      layout(); draw();
    }

    function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

    function draw() {
      ctx.clearRect(0, 0, SIDE, SIDE);
      lines.forEach(function (ln) {
        var L = geo.left[ln.li], R = geo.right[ln.ri];
        ctx.strokeStyle = 'rgba(65,201,138,.9)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(L.x + L.w, L.y + L.h / 2);
        ctx.bezierCurveTo(SIDE * .5, L.y + L.h / 2, SIDE * .5, R.y + R.h / 2, R.x, R.y + R.h / 2);
        ctx.stroke();
      });
      ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      left.forEach(function (it, i) {
        var g2 = geo.left[i];
        var gr = ctx.createLinearGradient(g2.x, g2.y, g2.x + g2.w, g2.y + g2.h);
        gr.addColorStop(0, (sel && sel.side === 'L' && sel.i === i) ? '#ffc94d' : '#66d4ff');
        gr.addColorStop(1, '#b388ff');
        ctx.fillStyle = gr; roundRect(ctx, g2.x, g2.y, g2.w, g2.h, 14); ctx.fill();
        ctx.fillStyle = '#123055'; ctx.fillText(it.text, g2.x + g2.w / 2, g2.y + g2.h / 2);
      });
      right.forEach(function (it, i) {
        var g2 = geo.right[i];
        var gr = ctx.createLinearGradient(g2.x, g2.y, g2.x + g2.w, g2.y + g2.h);
        gr.addColorStop(0, (sel && sel.side === 'R' && sel.i === i) ? '#ffc94d' : '#41c98a');
        gr.addColorStop(1, '#66d4ff');
        ctx.fillStyle = gr; roundRect(ctx, g2.x, g2.y, g2.w, g2.h, 14); ctx.fill();
        ctx.fillStyle = '#123055'; ctx.fillText(it.text, g2.x + g2.w / 2, g2.y + g2.h / 2);
      });
    }

    cv.addEventListener('pointerdown', function (ev) {
      var r = cv.getBoundingClientRect();
      var px = ev.clientX - r.left, py = ev.clientY - r.top;
      for (var i = 0; i < geo.left.length; i++) {
        var g2 = geo.left[i];
        if (px >= g2.x && px <= g2.x + g2.w && py >= g2.y && py <= g2.y + g2.h) {
          sel = { side: 'L', i: i }; api.sfx && api.sfx.pick(); draw(); return;
        }
      }
      for (var j = 0; j < geo.right.length; j++) {
        var r2 = geo.right[j];
        if (px >= r2.x && px <= r2.x + r2.w && py >= r2.y && py <= r2.y + r2.h) {
          if (!sel || sel.side !== 'L') { api.toast('先点左边'); return; }
          if (left[sel.i].key === right[j].key) {
            lines.push({ li: sel.i, ri: j });
            done++;
            api.gain(2, ev.clientX, ev.clientY, '配对');
            sel = null; draw();
            if (done === pairs.length) {
              box.querySelector('#hint').textContent = '全部连上啦！';
              var rr = cv.getBoundingClientRect();
              api.gain(10, rr.left + rr.width / 2, rr.top + rr.height / 2, '通关');
            }
          } else { api.miss(); sel = null; draw(); }
          return;
        }
      }
    });

    newRound();
    if (g.OMNI_LAYOUT) g.OMNI_LAYOUT.on(function () { newRound(); });
    window.addEventListener('resize', newRound, { passive: true });
  };
})(window);
