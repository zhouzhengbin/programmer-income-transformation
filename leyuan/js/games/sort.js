/* 拖拽分类：把物品拖进正确的桶。尺寸由 layout 驱动 */
(function (g) {
  'use strict';
  g.OMNI_GAMES = g.OMNI_GAMES || {};
  g.OMNI_GAMES.sort = function (box, api) {
    box.innerHTML =
      '<div class="playWrap"><canvas class="play" id="cv"></canvas></div>' +
      '<div class="btns"><button id="again" class="ghost">重来</button></div>' +
      '<div class="hint" id="hint">把物品拖到正确的桶里</div>';

    var cv = box.querySelector('#cv'), ctx = cv.getContext('2d');
    var SIDE = 0, W = 0, H = 0;
    var buckets = [
      { name: '水果', color: '#ff6b81', items: ['🍎','🍌','🍇','🍓'] },
      { name: '动物', color: '#66d4ff', items: ['🐱','🐶','🐰','🐻'] },
      { name: '交通', color: '#ffc94d', items: ['🚗','🚌','✈️','🚲'] }
    ];
    var tray = [], drag = null, placed = 0, total = 0;

    function sizeCanvas() {
      if (g.OMNI_LAYOUT) { var m = g.OMNI_LAYOUT.get(); W = m.w; H = m.h; }
      else { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; }
      SIDE = Math.max(220, Math.min(W - 20, H - 130));
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = SIDE * dpr; cv.height = SIDE * dpr;
      cv.style.width = SIDE + 'px'; cv.style.height = SIDE + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function layoutTray() {
      var cols = 6;
      var g2 = Math.min(48, SIDE / 8);
      var rows = Math.ceil(tray.length / cols);
      var totalH = rows * (g2 + 6);
      var oy = SIDE - totalH - 20;
      tray.forEach(function (p, i) {
        if (!p.home) return;
        var c = i % cols, r = Math.floor(i / cols);
        p.w = g2; p.h = g2;
        p.x = (SIDE - cols * (g2 + 6)) / 2 + c * (g2 + 6);
        p.y = oy + r * (g2 + 6);
      });
    }

    function newGame() {
      sizeCanvas();
      tray = [];
      buckets.forEach(function (b, bi) {
        b.items.forEach(function (it) { tray.push({ e: it, bucket: bi, home: true }); });
      });
      for (var i = tray.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = tray[i]; tray[i] = tray[j]; tray[j] = t; }
      placed = 0; total = tray.length;
      layoutTray();
      box.querySelector('#hint').textContent = '把物品拖到正确的桶里';
      draw();
    }

    function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

    function draw() {
      ctx.clearRect(0, 0, SIDE, SIDE);
      var bw = Math.min(140, SIDE / 3 - 12);
      var bh = Math.min(120, SIDE * .28);
      var oy = 16;
      buckets.forEach(function (b, i) {
        var x = (SIDE - (bw * 3 + 24)) / 2 + i * (bw + 12);
        var gr = ctx.createLinearGradient(x, oy, x, oy + bh);
        gr.addColorStop(0, b.color); gr.addColorStop(1, 'rgba(255,255,255,.55)');
        roundRect(ctx, x, oy, bw, bh, 14); ctx.fillStyle = gr; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#123055'; ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(b.name, x + bw / 2, oy + 8);
      });
      tray.forEach(function (p) {
        if (!p.home || drag === p) return;
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        roundRect(ctx, p.x, p.y, p.w, p.h, 10); ctx.fill();
        ctx.font = (p.h * .8) + 'px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(p.e, p.x + p.w / 2, p.y + p.h / 2);
      });
      if (drag) { ctx.font = (drag.h * .95) + 'px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(drag.e, drag.x + drag.w / 2, drag.y + drag.h / 2); }
    }

    function pos(ev) { var r = cv.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }

    cv.addEventListener('pointerdown', function (ev) {
      var p = pos(ev);
      for (var i = tray.length - 1; i >= 0; i--) {
        var it = tray[i];
        if (!it.home) continue;
        if (p.x >= it.x - 6 && p.x <= it.x + it.w + 6 && p.y >= it.y - 6 && p.y <= it.y + it.h + 6) {
          drag = it; api.sfx && api.sfx.pick(); draw(); return;
        }
      }
    });
    cv.addEventListener('pointermove', function (ev) {
      if (!drag) return;
      var p = pos(ev);
      drag.x = p.x - drag.w / 2; drag.y = p.y - drag.h / 2;
      draw();
    });
    cv.addEventListener('pointerup', function (ev) {
      if (!drag) return;
      var bw = Math.min(140, SIDE / 3 - 12);
      var bh = Math.min(120, SIDE * .28);
      var oy = 16;
      var cx = drag.x + drag.w / 2, cy = drag.y + drag.h / 2;
      var hit = -1;
      buckets.forEach(function (b, i) {
        var x = (SIDE - (bw * 3 + 24)) / 2 + i * (bw + 12);
        if (cx >= x && cx <= x + bw && cy >= oy && cy <= oy + bh) hit = i;
      });
      var r = cv.getBoundingClientRect();
      if (hit === drag.bucket) {
        drag.home = false; placed++;
        api.gain(2, ev.clientX, ev.clientY, '分类对');
        if (placed === total) {
          box.querySelector('#hint').textContent = '全部分好啦！';
          api.gain(15, r.left + r.width / 2, r.top + r.height / 2, '通关');
        }
      } else { api.miss(); layoutTray(); }
      drag = null; draw();
    });

    box.querySelector('#again').onclick = newGame;
    newGame();
    if (g.OMNI_LAYOUT) g.OMNI_LAYOUT.on(function () { newGame(); });
    window.addEventListener('resize', newGame, { passive: true });
  };
})(window);
