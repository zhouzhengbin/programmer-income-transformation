/* 翻牌记忆：翻两张找相同图案。尺寸由 layout 提供，小屏自动 3 列 8 张 */
(function (g) {
  'use strict';
  g.OMNI_GAMES = g.OMNI_GAMES || {};
  g.OMNI_GAMES.memory = function (box, api) {
    box.innerHTML =
      '<div class="playWrap"><canvas class="play" id="cv"></canvas></div>' +
      '<div class="btns"><button id="again" class="ghost">重来</button></div>' +
      '<div class="hint" id="hint">点两张，找一样的图案</div>';

    var cv = box.querySelector('#cv'), ctx = cv.getContext('2d');
    var SIDE = 420, W = 0, H = 0;
    var cards = [], first = -1, lock = false, matched = 0, flips = 0, cols = 4, rows = 3;
    var POOL = ['🍎','🌟','🐱','🐶','🌈','🍭'];

    function sizeCanvas() {
      if (g.OMNI_LAYOUT) { var m = g.OMNI_LAYOUT.get(); W = m.w; H = m.h; }
      else { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; }
      SIDE = Math.max(220, Math.min(W - 20, H - 150));
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = SIDE * dpr; cv.height = SIDE * dpr;
      cv.style.width = SIDE + 'px'; cv.style.height = SIDE + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function newGame() {
      sizeCanvas();
      var need = (SIDE < 320) ? 4 : 6; /* 小屏 8 张，大屏 12 张 */
      var use = POOL.slice(0, need);
      cards = [];
      use.forEach(function (e) { cards.push({ e: e, open: false, done: false }); cards.push({ e: e, open: false, done: false }); });
      for (var i = cards.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = cards[i]; cards[i] = cards[j]; cards[j] = t; }
      cols = (cards.length === 8) ? 4 : 4;
      rows = cards.length / cols;
      first = -1; lock = false; matched = 0; flips = 0;
      box.querySelector('#hint').textContent = '点两张，找一样的图案';
      draw();
    }

    function draw() {
      ctx.clearRect(0, 0, SIDE, SIDE);
      var pad = 12;
      var cw = (SIDE - pad * (cols + 1)) / cols;
      var ch = (SIDE - pad * (rows + 1)) / rows;
      var ch2 = Math.min(cw, ch);
      var ox = (SIDE - (cw * cols + pad * (cols - 1))) / 2;
      var oy = (SIDE - (ch2 * rows + pad * (rows - 1))) / 2;
      var radius = Math.max(8, ch2 * .16);
      cards.forEach(function (c, i) {
        var r = Math.floor(i / cols), col = i % cols;
        var x = ox + col * (cw + pad), y = oy + r * (ch2 + pad);
        roundRect(ctx, x, y, cw, ch2, radius);
        if (c.done) { ctx.fillStyle = 'rgba(65,201,138,.35)'; ctx.fill(); ctx.strokeStyle = '#41c98a'; }
        else if (c.open) { ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#66d4ff'; }
        else { var grd = ctx.createLinearGradient(x, y, x, y + ch2); grd.addColorStop(0, '#ff7fb6'); grd.addColorStop(1, '#66d4ff'); ctx.fillStyle = grd; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.9)'; }
        ctx.lineWidth = 3; ctx.stroke();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (c.open || c.done) {
          ctx.font = (ch2 * .55) + 'px serif';
          ctx.fillText(c.e, x + cw / 2, y + ch2 / 2);
        } else {
          ctx.font = 'bold ' + (ch2 * .38) + 'px sans-serif';
          ctx.fillStyle = 'rgba(18,48,85,.7)';
          ctx.fillText('?', x + cw / 2, y + ch2 / 2);
        }
      });
    }

    function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

    cv.addEventListener('pointerdown', function (ev) {
      if (lock) return;
      var rect = cv.getBoundingClientRect();
      var px = ev.clientX - rect.left, py = ev.clientY - rect.top;
      var pad = 12;
      var cw = (SIDE - pad * (cols + 1)) / cols;
      var ch = (SIDE - pad * (rows + 1)) / rows;
      var ch2 = Math.min(cw, ch);
      var ox = (SIDE - (cw * cols + pad * (cols - 1))) / 2;
      var oy = (SIDE - (ch2 * rows + pad * (rows - 1))) / 2;
      for (var i = 0; i < cards.length; i++) {
        var r = Math.floor(i / cols), col = i % cols;
        var x = ox + col * (cw + pad), y = oy + r * (ch2 + pad);
        if (px >= x && px <= x + cw && py >= y && py <= y + ch2) {
          var c = cards[i];
          if (c.open || c.done) return;
          c.open = true; api.sfx && api.sfx.pick(); flips++;
          draw();
          if (first < 0) { first = i; return; }
          lock = true;
          var a = cards[first], b = cards[i];
          if (a.e === b.e) {
            setTimeout(function () {
              a.done = b.done = true; matched++;
              api.gain(2, rect.left + x + cw / 2, rect.top + y + ch2 / 2, '配对');
              first = -1; lock = false; draw();
              if (matched === cards.length / 2) {
                box.querySelector('#hint').textContent = '全部配对！翻了 ' + flips + ' 次';
                api.gain(10, rect.left + rect.width / 2, rect.top + rect.height / 2, '通关');
              }
            }, 240);
          } else {
            setTimeout(function () {
              a.open = b.open = false; first = -1; lock = false;
              api.miss(); draw();
            }, 620);
          }
          return;
        }
      }
    });

    box.querySelector('#again').onclick = newGame;
    newGame();
    if (g.OMNI_LAYOUT) g.OMNI_LAYOUT.on(function () { newGame(); });
    window.addEventListener('resize', newGame, { passive: true });
  };
})(window);
