/* 天平称重：拖砝码让两边相等。尺寸由 layout 驱动 */
(function (g) {
  'use strict';
  g.OMNI_GAMES = g.OMNI_GAMES || {};
  g.OMNI_GAMES.balance = function (box, api) {
    box.innerHTML =
      '<div class="playWrap"><canvas class="play" id="cv"></canvas></div>' +
      '<div class="btns"><button id="again" class="ghost">换一题</button></div>' +
      '<div class="hint" id="hint">把砝码放两边，让天平平衡</div>';

    var cv = box.querySelector('#cv'), ctx = cv.getContext('2d');
    var SIDE = 0;
    var left = [], right = [], pool = [];
    var drag = null, ox = 0, oy = 0, target = 0, solved = false;

    function sizeCanvas() {
      var m = (g.OMNI_LAYOUT && g.OMNI_LAYOUT.get()) || null;
      var W, H;
      if (m) { W = m.w; H = m.h; } else { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; }
      SIDE = Math.max(220, Math.min(W - 20, H - 130));
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = SIDE * dpr; cv.height = SIDE * dpr;
      cv.style.width = SIDE + 'px'; cv.style.height = SIDE + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function newGame() {
      sizeCanvas();
      left = []; right = []; pool = []; solved = false;
      var weights = [1, 2, 3, 4, 5, 6];
      for (var i = weights.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = weights[i]; weights[i] = weights[j]; weights[j] = t; }
      var lc = 2 + Math.floor(Math.random() * 2);
      for (var k = 0; k < lc; k++) left.push({ w: weights[k] });
      for (var k2 = lc; k2 < weights.length; k2++) pool.push({ w: weights[k2], home: true });
      target = left.reduce(function (s, x) { return s + x.w; }, 0);
      layoutPool();
      box.querySelector('#hint').textContent = '让右边也等于 ' + target;
      draw();
    }

    function layoutPool() {
      var g2 = Math.min(56, SIDE / 8);
      var cols = Math.min(6, Math.max(3, Math.floor(SIDE / (g2 + 10))));
      pool.forEach(function (p, i) {
        p.w2 = g2; p.h2 = g2;
        var c = i % cols, r = Math.floor(i / cols);
        p.x = 14 + c * (g2 + 8);
        p.y = SIDE - g2 - 16 - r * (g2 + 8);
      });
    }

    function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

    function draw() {
      ctx.clearRect(0, 0, SIDE, SIDE);
      var poleX = SIDE / 2, baseY = SIDE * .34;
      ctx.strokeStyle = 'rgba(18,48,85,.85)'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(poleX, baseY - 110); ctx.lineTo(poleX, baseY); ctx.stroke();
      var sumL = left.reduce(function (s, x) { return s + x.w; }, 0);
      var sumR = right.reduce(function (s, x) { return s + x.w; }, 0);
      var tilt = Math.max(-0.35, Math.min(0.35, (sumR - sumL) * 0.05));
      var beamLen = Math.min(SIDE * .38, 200);
      ctx.save(); ctx.translate(poleX, baseY - 110); ctx.rotate(tilt);
      ctx.strokeStyle = 'rgba(18,48,85,.9)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-beamLen, 0); ctx.lineTo(beamLen, 0); ctx.stroke();
      ctx.strokeStyle = 'rgba(18,48,85,.6)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-beamLen, 0); ctx.lineTo(-beamLen, 36); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(beamLen, 0); ctx.lineTo(beamLen, 36); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-beamLen, 52, 48, 16, 0, Math.PI, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(beamLen, 52, 48, 16, 0, Math.PI, Math.PI * 2); ctx.stroke();
      ctx.restore();
      ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var startY = baseY - 110 + 46;
      left.forEach(function (b, i) {
        var x = poleX - beamLen - 26 + (i % 4) * 22, y = startY - Math.floor(i / 4) * 22;
        ctx.fillStyle = '#66d4ff'; roundRect(ctx, x, y, 26, 22, 6); ctx.fill();
        ctx.fillStyle = '#123055'; ctx.fillText(b.w, x + 13, y + 11);
      });
      right.forEach(function (b, i) {
        var x = poleX + beamLen - 26 + (i % 4) * 22, y = startY - Math.floor(i / 4) * 22;
        ctx.fillStyle = '#41c98a'; roundRect(ctx, x, y, 26, 22, 6); ctx.fill();
        ctx.fillStyle = '#123055'; ctx.fillText(b.w, x + 13, y + 11);
      });
      pool.forEach(function (p) {
        if (drag === p) return;
        ctx.fillStyle = '#b388ff'; roundRect(ctx, p.x, p.y, p.w2, p.h2, 10); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillText(p.w, p.x + p.w2 / 2, p.y + p.h2 / 2);
      });
      if (drag) { ctx.fillStyle = '#ffc94d'; roundRect(ctx, drag.x, drag.y, drag.w2, drag.h2, 10); ctx.fill(); ctx.fillStyle = '#123055'; ctx.fillText(drag.w, drag.x + drag.w2 / 2, drag.y + drag.h2 / 2); }
      ctx.fillStyle = 'rgba(18,48,85,.85)'; ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('左 ' + sumL + ' · 右 ' + sumR, 12, 12);
      if (sumL === sumR && !solved) {
        solved = true;
        var r = cv.getBoundingClientRect();
        api.gain(15, r.left + r.width / 2, r.top + r.height / 2, '平衡了');
        box.querySelector('#hint').textContent = '平衡成功！';
      }
    }

    function pos(ev) { var r = cv.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }
    cv.addEventListener('pointerdown', function (ev) {
      var p = pos(ev);
      for (var i = pool.length - 1; i >= 0; i--) {
        var pc = pool[i];
        if (p.x >= pc.x && p.x <= pc.x + pc.w2 && p.y >= pc.y && p.y <= pc.y + pc.h2) {
          drag = pc; ox = p.x - pc.x; oy = p.y - pc.y;
          api.sfx && api.sfx.pick(); draw(); return;
        }
      }
    });
    cv.addEventListener('pointermove', function (ev) {
      if (!drag) return;
      var p = pos(ev);
      drag.x = p.x - ox; drag.y = p.y - oy;
      draw();
    });
    cv.addEventListener('pointerup', function () {
      if (!drag) return;
      var cx = drag.x + drag.w2 / 2, cy = drag.y + drag.h2 / 2;
      var poleX = SIDE / 2, baseY = SIDE * .34;
      var beamLen = Math.min(SIDE * .38, 200);
      var startY = baseY - 110 + 46;
      if (cy < startY + 60) {
        if (cx < poleX) { left.push({ w: drag.w }); pool.splice(pool.indexOf(drag), 1); }
        else { right.push({ w: drag.w }); pool.splice(pool.indexOf(drag), 1); }
      } else { layoutPool(); }
      drag = null;
      draw();
    });

    box.querySelector('#again').onclick = newGame;
    newGame();
    if (g.OMNI_LAYOUT) g.OMNI_LAYOUT.on(function () { newGame(); });
    window.addEventListener('resize', newGame, { passive: true });
  };
})(window);
