/* 迷宫寻宝：拖动小球穿过迷宫找到宝箱。尺寸由 layout 驱动 */
(function (g) {
  'use strict';
  g.OMNI_GAMES = g.OMNI_GAMES || {};
  g.OMNI_GAMES.maze = function (box, api) {
    box.innerHTML =
      '<div class="playWrap"><canvas class="play" id="cv"></canvas></div>' +
      '<div class="btns"><button id="again" class="ghost">新迷宫</button></div>' +
      '<div class="hint" id="hint">从起点拖到宝箱</div>';

    var cv = box.querySelector('#cv'), ctx = cv.getContext('2d');
    var N = 11, SIDE = 0, cell = 0, ox = 0, oy = 0;
    var grid = [], player = { cx: 1, cy: 1 }, goal = { cx: N - 2, cy: N - 2 };
    var dragging = false, won = false;

    function rnd(n) { return Math.floor(Math.random() * n); }

    function sizeCanvas() {
      var m = (g.OMNI_LAYOUT && g.OMNI_LAYOUT.get()) || null;
      var W, H;
      if (m) { W = m.w; H = m.h; } else { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; }
      SIDE = Math.max(220, Math.min(W - 20, H - 130));
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = SIDE * dpr; cv.height = SIDE * dpr;
      cv.style.width = SIDE + 'px'; cv.style.height = SIDE + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = SIDE / N;
      ox = (SIDE - cell * N) / 2;
      oy = (SIDE - cell * N) / 2;
    }

    function newMaze() {
      sizeCanvas();
      grid = [];
      for (var y = 0; y < N; y++) { var row = []; for (var x = 0; x < N; x++) row.push(1); grid.push(row); }
      var stack = [{ x: 1, y: 1 }];
      grid[1][1] = 0;
      while (stack.length) {
        var c = stack[stack.length - 1];
        var dirs = [[2,0],[-2,0],[0,2],[0,-2]];
        for (var i = dirs.length - 1; i > 0; i--) { var j = rnd(i + 1); var t = dirs[i]; dirs[i] = dirs[j]; dirs[j] = t; }
        var moved = false;
        for (var k = 0; k < dirs.length; k++) {
          var nx = c.x + dirs[k][0], ny = c.y + dirs[k][1];
          if (nx > 0 && ny > 0 && nx < N && ny < N && grid[ny][nx] === 1) {
            grid[ny][nx] = 0;
            grid[c.y + dirs[k][1] / 2][c.x + dirs[k][0] / 2] = 0;
            stack.push({ x: nx, y: ny }); moved = true; break;
          }
        }
        if (!moved) stack.pop();
      }
      player = { cx: 1, cy: 1 };
      won = false;
      box.querySelector('#hint').textContent = '从起点拖到宝箱';
      draw();
    }

    function draw() {
      ctx.clearRect(0, 0, SIDE, SIDE);
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        var px = ox + x * cell, py = oy + y * cell;
        if (grid[y] && grid[y][x] === 1) {
          var gr = ctx.createLinearGradient(px, py, px + cell, py + cell);
          gr.addColorStop(0, '#8fb8ff'); gr.addColorStop(1, '#5f8ee0');
          ctx.fillStyle = gr;
          ctx.fillRect(px, py, cell - 1, cell - 1);
        } else {
          ctx.fillStyle = 'rgba(255,255,255,.55)';
          ctx.fillRect(px, py, cell - 1, cell - 1);
        }
      }
      ctx.font = (cell * .8) + 'px serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🎁', ox + goal.cx * cell + cell / 2, oy + goal.cy * cell + cell / 2);
      var cx = ox + player.cx * cell + cell / 2, cy = oy + player.cy * cell + cell / 2;
      var pg = ctx.createRadialGradient(cx - cell * .15, cy - cell * .15, 2, cx, cy, cell * .42);
      pg.addColorStop(0, '#fff'); pg.addColorStop(1, '#ff7fb6');
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.arc(cx, cy, cell * .36, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 2; ctx.stroke();
    }

    function px2cell(px, py) { return { cx: Math.floor((px - ox) / cell), cy: Math.floor((py - oy) / cell) }; }
    function isOpen(cx, cy) { return cy >= 0 && cy < N && cx >= 0 && cx < N && grid[cy][cx] === 0; }

    function tryMove(tx, ty) {
      var guard = 0;
      while ((player.cx !== tx || player.cy !== ty) && guard++ < 220) {
        var dx = Math.sign(tx - player.cx), dy = Math.sign(ty - player.cy);
        if (dx !== 0 && isOpen(player.cx + dx, player.cy)) player.cx += dx;
        else if (dy !== 0 && isOpen(player.cx, player.cy + dy)) player.cy += dy;
        else break;
      }
      draw();
      if (player.cx === goal.cx && player.cy === goal.cy && !won) {
        won = true;
        var r = cv.getBoundingClientRect();
        api.gain(15, r.left + r.width / 2, r.top + r.height / 2, '找到宝箱');
        box.querySelector('#hint').textContent = '找到啦！点“新迷宫”再来';
      }
    }

    cv.addEventListener('pointerdown', function (ev) {
      dragging = true;
      var r = cv.getBoundingClientRect();
      var c = px2cell(ev.clientX - r.left, ev.clientY - r.top);
      tryMove(c.cx, c.cy);
    });
    cv.addEventListener('pointermove', function (ev) {
      if (!dragging) return;
      var r = cv.getBoundingClientRect();
      var c = px2cell(ev.clientX - r.left, ev.clientY - r.top);
      if (isOpen(c.cx, c.cy)) tryMove(c.cx, c.cy);
    });
    cv.addEventListener('pointerup', function () { dragging = false; });
    cv.addEventListener('pointerleave', function () { dragging = false; });

    box.querySelector('#again').onclick = newMaze;
    newMaze();
    if (g.OMNI_LAYOUT) g.OMNI_LAYOUT.on(function () { newMaze(); });
    window.addEventListener('resize', newMaze, { passive: true });
  };
})(window);
