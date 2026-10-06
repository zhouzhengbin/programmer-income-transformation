/* 拼图板 v2：真实图案（每块唯一图形）+ 棋盘靠右 + 全尺寸自适应 + 顺畅拖拽 */
(function (g) {
  'use strict';
  g.OMNI_GAMES = g.OMNI_GAMES || {};
  g.OMNI_GAMES.puzzle = function (box, api) {
    box.innerHTML =
      '<div class="playWrap"><canvas class="play" id="cv"></canvas></div>' +
      '<div class="btns"><button id="again" class="ghost">重来</button><button id="level" class="ghost">难度</button></div>' +
      '<div class="hint" id="hint">把左边的拼块拖进右边的棋盘</div>';

    var cv = box.querySelector('#cv'), ctx = cv.getContext('2d');
    var SIDE = 300, N = 4;
    var pieces = [], drag = null, dragOff = { x: 0, y: 0 };
    var board = { x: 0, y: 0, w: 0, h: 0, cell: 0 };
    var tray = { x: 0, y: 0, w: 0, h: 0 };
    var solved = 0, total = 0, shake = 0;

    /* 每块拼图的唯一图案：色底 + 图形 + 序号 */
    var PALETTE = ['#ff7fb6', '#ffc94d', '#66d4ff', '#41c98a', '#b388ff', '#ff9d6b', '#5ee7ff', '#f9a8d4', '#8bd3a8', '#f6c98a', '#9ec6ff', '#ffb3d1', '#c2a4ff', '#ffd9a0', '#a0e7e5', '#f7a8a8'];

    function layoutCanvas() {
      var m = (g.OMNI_LAYOUT && g.OMNI_LAYOUT.get()) || null;
      var W, H;
      if (m) { W = m.w; H = m.h; } else { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; }
      SIDE = Math.max(240, Math.floor(Math.min(W - 8, H - 96)));
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = SIDE * dpr; cv.height = SIDE * dpr;
      cv.style.width = SIDE + 'px'; cv.style.height = SIDE + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function computeLayout() {
      /* 左 1/3 为待拼池，右 2/3 为棋盘 */
      var gap = Math.max(8, SIDE * .02);
      var trayW = Math.floor(SIDE * .30);
      tray.x = gap; tray.y = gap;
      tray.w = trayW - gap * 1.5; tray.h = SIDE - gap * 2;

      var boardX = trayW + gap * .5;
      var boardMax = SIDE - boardX - gap;
      board.w = boardMax;
      board.h = boardMax;
      board.cell = board.w / N;
      board.x = boardX;
      board.y = (SIDE - board.h) / 2;
    }

    function newGame() {
      layoutCanvas();
      computeLayout();
      pieces = [];
      solved = 0;
      var idx = 0;
      for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
        pieces.push({
          r: r, c: c, idx: idx++,
          placed: false,
          x: 0, y: 0, w: 0, h: 0,
          tx: board.x + c * board.cell,
          ty: board.y + r * board.cell,
          color: PALETTE[idx % PALETTE.length]
        });
      }
      /* 打乱后放进左侧池子 */
      for (var i = pieces.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = pieces[i]; pieces[i] = pieces[j]; pieces[j] = t; }
      layoutTray();
      total = pieces.length;
      box.querySelector('#hint').textContent = '把左边的拼块拖进右边的棋盘';
      draw();
    }

    function layoutTray() {
      var cols = 3;
      var g2 = Math.min(tray.w / cols, tray.h / 6) * .9;
      pieces.forEach(function (p, i) {
        if (p.placed) return;
        var c = i % cols, r = Math.floor(i / cols);
        p.w = g2; p.h = g2;
        p.x = tray.x + c * (g2 + 6);
        p.y = tray.y + r * (g2 + 6);
      });
    }

    /* 画一块：色底 + 白圆 + 内色点 + 序号 */
    function drawTile(x, y, w, h, idx) {
      var col = PALETTE[idx % PALETTE.length];
      var gr = ctx.createLinearGradient(x, y, x + w, y + h);
      gr.addColorStop(0, col);
      gr.addColorStop(1, 'rgba(255,255,255,.92)');
      ctx.fillStyle = gr;
      roundRect(ctx, x, y, w, h, Math.max(6, w * .14));
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = Math.max(2, w * .05);
      ctx.stroke();
      /* 中心白圆 */
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w * .28, 0, Math.PI * 2); ctx.fill();
      /* 内色点 */
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w * .14, 0, Math.PI * 2); ctx.fill();
      /* 角标：行列序号 */
      var r = Math.floor(idx / N) + 1, c = (idx % N) + 1;
      ctx.fillStyle = 'rgba(18,48,85,.75)';
      ctx.font = 'bold ' + Math.max(9, w * .2) + 'px sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.fillText(r + ',' + c, x + w - w * .08, y + h - h * .06);
    }

    function roundRect(c, x, y, w, h, rad) {
      c.beginPath();
      c.moveTo(x + rad, y);
      c.arcTo(x + w, y, x + w, y + h, rad);
      c.arcTo(x + w, y + h, x, y + h, rad);
      c.arcTo(x, y + h, x, y, rad);
      c.arcTo(x, y, x + w, y, rad);
      c.closePath();
    }

    function draw() {
      var sx = shake ? Math.sin(performance.now() / 30) * 4 : 0;
      ctx.clearRect(0, 0, SIDE, SIDE);
      /* 左池背景 */
      ctx.fillStyle = 'rgba(255,255,255,.42)';
      roundRect(ctx, tray.x - 4, tray.y - 4, tray.w + 8, tray.h + 8, 14);
      ctx.fill();
      /* 棋盘 */
      ctx.fillStyle = 'rgba(255,255,255,.65)';
      roundRect(ctx, board.x - 6, board.y - 6, board.w + 12, board.h + 12, 14);
      ctx.fill();
      for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
        ctx.strokeStyle = 'rgba(18,48,85,.18)'; ctx.lineWidth = 2;
        ctx.strokeRect(board.x + c * board.cell, board.y + r * board.cell, board.cell, board.cell);
      }
      /* 已就位 */
      pieces.forEach(function (p) {
        if (!p.placed) return;
        ctx.save(); ctx.translate(sx, 0);
        drawTile(p.tx, p.ty, board.cell, board.cell, p.idx);
        ctx.restore();
      });
      /* 待拼 */
      pieces.forEach(function (p) {
        if (p.placed || drag === p) return;
        drawTile(p.x, p.y, p.w, p.h, p.idx);
      });
      if (drag) drawTile(drag.x, drag.y, drag.w, drag.h, drag.idx);
      if (shake) { shake--; requestAnimationFrame(draw); }
    }

    function pos(ev) { var r = cv.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }

    cv.addEventListener('pointerdown', function (ev) {
      var p = pos(ev);
      for (var i = pieces.length - 1; i >= 0; i--) {
        var pc = pieces[i];
        if (pc.placed) continue;
        if (p.x >= pc.x - 6 && p.x <= pc.x + pc.w + 6 && p.y >= pc.y - 6 && p.y <= pc.y + pc.h + 6) {
          drag = pc;
          dragOff.x = p.x - pc.x; dragOff.y = p.y - pc.y;
          /* 抓起时放大一点，视觉反馈 */
          pc.w = pc.w * 1.15; pc.h = pc.h * 1.15;
          cv.setPointerCapture && cv.setPointerCapture(ev.pointerId);
          api.sfx && api.sfx.pick();
          draw();
          return;
        }
      }
    });

    cv.addEventListener('pointermove', function (ev) {
      if (!drag) return;
      var p = pos(ev);
      drag.x = p.x - dragOff.x; drag.y = p.y - dragOff.y;
      draw();
    });

    cv.addEventListener('pointerup', function (ev) {
      if (!drag) return;
      var pc = drag;
      var cx = pc.x + pc.w / 2, cy = pc.y + pc.h / 2;
      var gx = Math.floor((cx - board.x) / board.cell);
      var gy = Math.floor((cy - board.y) / board.cell);
      var inBoard = gx >= 0 && gy >= 0 && gx < N && gy < N;
      var correct = inBoard && (gx === pc.c) && (gy === pc.r);

      if (correct) {
        pc.placed = true;
        pc.tx = board.x + pc.c * board.cell;
        pc.ty = board.y + pc.r * board.cell;
        pc.w = board.cell; pc.h = board.cell;
        solved++;
        var r = cv.getBoundingClientRect();
        api.gain(2, r.left + pc.tx + board.cell / 2, r.top + pc.ty + board.cell / 2, '拼好');
        if (solved === total) {
          box.querySelector('#hint').textContent = '拼好啦！';
          api.gain(15, r.left + r.width / 2, r.top + r.height / 2, '通关');
        }
      } else {
        api.miss();
        /* 抖动并回池 */
        pc.w = pc.w / 1.15; pc.h = pc.h / 1.15;
        layoutTray();
        shake = 12;
      }
      drag = null;
      draw();
    });

    cv.addEventListener('pointercancel', function () {
      if (drag) { drag.w = drag.w / 1.15; drag.h = drag.h / 1.15; layoutTray(); drag = null; draw(); }
    });

    box.querySelector('#again').onclick = newGame;
    box.querySelector('#level').onclick = function () {
      N = N === 4 ? 3 : (N === 3 ? 5 : 4);
      api.toast(N + 'x' + N);
      newGame();
    };

    newGame();
    if (g.OMNI_LAYOUT) g.OMNI_LAYOUT.on(function () { newGame(); });
    window.addEventListener('resize', function () { newGame(); }, { passive: true });
  };
})(window);
