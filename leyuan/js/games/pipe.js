/* 管道拼接：旋转碎片把水引到花盆。尺寸由 layout 驱动 */
(function (g) {
  'use strict';
  g.OMNI_GAMES = g.OMNI_GAMES || {};
  g.OMNI_GAMES.pipe = function (box, api) {
    box.innerHTML =
      '<div class="playWrap"><canvas class="play" id="cv"></canvas></div>' +
      '<div class="btns"><button id="again" class="ghost">换一关</button></div>' +
      '<div class="hint" id="hint">点方块旋转，把水引到花盆</div>';

    var cv = box.querySelector('#cv'), ctx = cv.getContext('2d');
    var N = 4, SIDE = 0, cell = 0, ox = 0, oy = 0;
    var grid = [], solved = false;
    var shapes = [3, 6, 12, 9, 5, 10, 7, 13, 14, 11];

    function rot(m) { return ((m << 1) | (m >> 3)) & 15; }

    function sizeCanvas() {
      var m = (g.OMNI_LAYOUT && g.OMNI_LAYOUT.get()) || null;
      var W, H;
      if (m) { W = m.w; H = m.h; } else { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; }
      SIDE = Math.max(220, Math.min(W - 20, H - 130));
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = SIDE * dpr; cv.height = SIDE * dpr;
      cv.style.width = SIDE + 'px'; cv.style.height = SIDE + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = SIDE * .85 / N;
      ox = (SIDE - cell * N) / 2;
      oy = (SIDE - cell * N) / 2;
    }

    function newBoard() {
      sizeCanvas();
      grid = [];
      for (var y = 0; y < N; y++) {
        var row = [];
        for (var x = 0; x < N; x++) {
          var m2 = shapes[Math.floor(Math.random() * shapes.length)];
          row.push({ m: m2, r: Math.floor(Math.random() * 4) });
        }
        grid.push(row);
      }
      grid[0][0].m = (grid[0][0].m | 2 | 4) & 15;
      grid[N - 1][N - 1].m = (grid[N - 1][N - 1].m | 1 | 8) & 15;
      solved = false;
      box.querySelector('#hint').textContent = '点方块旋转，把水引到花盆';
      draw();
    }

    function curMask(g2) { var m = g2.m; for (var i = 0; i < g2.r; i++) m = rot(m); return m; }

    function flow() {
      var seen = {}, q = [[0, 0]];
      while (q.length) {
        var c = q.shift();
        var k = c[0] + ',' + c[1];
        if (seen[k]) continue; seen[k] = 1;
        var x = c[0], y = c[1];
        var m = curMask(grid[y][x]);
        if (m & 1 && y > 0 && (curMask(grid[y - 1][x]) & 4)) q.push([x, y - 1]);
        if (m & 2 && x < N - 1 && (curMask(grid[y][x + 1]) & 8)) q.push([x + 1, y]);
        if (m & 4 && y < N - 1 && (curMask(grid[y + 1][x]) & 1)) q.push([x, y + 1]);
        if (m & 8 && x > 0 && (curMask(grid[y][x - 1]) & 2)) q.push([x - 1, y]);
      }
      return !!seen[(N - 1) + ',' + (N - 1)];
    }

    function draw() {
      ctx.clearRect(0, 0, SIDE, SIDE);
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        var px = ox + x * cell, py = oy + y * cell;
        ctx.fillStyle = 'rgba(255,255,255,.6)';
        ctx.fillRect(px, py, cell - 3, cell - 3);
        var m = curMask(grid[y][x]);
        ctx.strokeStyle = '#66d4ff'; ctx.lineWidth = Math.max(4, cell * .16); ctx.lineCap = 'round';
        var cx = px + cell / 2, cy = py + cell / 2;
        if (m & 1) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, py + 4); ctx.stroke(); }
        if (m & 2) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px + cell - 4, cy); ctx.stroke(); }
        if (m & 4) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, py + cell - 4); ctx.stroke(); }
        if (m & 8) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px + 4, cy); ctx.stroke(); }
        ctx.fillStyle = '#b388ff';
        ctx.beginPath(); ctx.arc(cx, cy, cell * .1, 0, Math.PI * 2); ctx.fill();
      }
      ctx.font = 'bold ' + (cell * .45) + 'px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('💧', ox - cell * .6, oy + cell / 2);
      ctx.fillText('🪴', ox + cell * N + 4, oy + cell * (N - .5));
      if (flow() && !solved) {
        solved = true;
        var r = cv.getBoundingClientRect();
        api.gain(15, r.left + r.width / 2, r.top + r.height / 2, '通了');
        box.querySelector('#hint').textContent = '水流到啦！点“换一关”继续';
      }
    }

    cv.addEventListener('pointerdown', function (ev) {
      var r = cv.getBoundingClientRect();
      var px = ev.clientX - r.left, py = ev.clientY - r.top;
      var cx = Math.floor((px - ox) / cell), cy = Math.floor((py - oy) / cell);
      if (cx < 0 || cy < 0 || cx >= N || cy >= N) return;
      grid[cy][cx].r = (grid[cy][cx].r + 1) % 4;
      api.sfx && api.sfx.pick();
      draw();
    });

    box.querySelector('#again').onclick = newBoard;
    newBoard();
    if (g.OMNI_LAYOUT) g.OMNI_LAYOUT.on(function () { newBoard(); });
    window.addEventListener('resize', newBoard, { passive: true });
  };
})(window);
