/* 节奏点击：音符落进判定圈时点击，越准星越多。尺寸由 layout 驱动，小屏自动 3 车道 */
(function (g) {
  'use strict';
  g.OMNI_GAMES = g.OMNI_GAMES || {};
  g.OMNI_GAMES.rhythm = function (box, api) {
    box.innerHTML =
      '<div class="playWrap"><canvas class="play" id="cv"></canvas></div>' +
      '<div class="btns"><button id="start">开始</button></div>' +
      '<div class="hint" id="hint">音符到圈里点一下</div>';

    var cv = box.querySelector('#cv'), ctx = cv.getContext('2d');
    var W = 0, H = 0, SIDE = 0, lanes = 4;
    var laneX = [], judgeY = 0, judgeR = 36;
    var notes = [], playing = false, t0 = 0, nextSpawn = 0;
    var score = 0, perfect = 0, miss = 0;
    var raf = 0;
    var COLORS = ['#ff7fb6', '#66d4ff', '#ffc94d', '#41c98a'];

    function sizeCanvas() {
      if (g.OMNI_LAYOUT) { var m = g.OMNI_LAYOUT.get(); W = m.w; H = m.h; }
      else { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; }
      SIDE = Math.max(220, Math.min(W - 20, H - 130));
      lanes = (SIDE < 340) ? 3 : 4;
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = SIDE * dpr; cv.height = SIDE * dpr;
      cv.style.width = SIDE + 'px'; cv.style.height = SIDE + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      laneX = [];
      for (var i = 0; i < lanes; i++) laneX.push(SIDE * (i + .5) / lanes);
      judgeY = SIDE - 84;
      judgeR = Math.min(40, SIDE / (lanes * 2 + 2));
    }

    function spawn() {
      var lane = Math.floor(Math.random() * lanes);
      notes.push({ x: laneX[lane], y: 0, lane: lane, hitTime: performance.now() + 1400, c: COLORS[lane % COLORS.length] });
    }

    function loop() {
      if (!playing) return;
      raf = requestAnimationFrame(loop);
      var now = performance.now();
      if (now - nextSpawn > 620) { nextSpawn = now; spawn(); }
      ctx.clearRect(0, 0, SIDE, SIDE);
      laneX.forEach(function (x) {
        var gr = ctx.createLinearGradient(0, 0, 0, SIDE);
        gr.addColorStop(0, 'rgba(102,212,255,.06)'); gr.addColorStop(1, 'rgba(255,127,182,.22)');
        ctx.fillStyle = gr; ctx.fillRect(x - 30, 0, 60, SIDE);
      });
      laneX.forEach(function (x) {
        ctx.beginPath(); ctx.arc(x, judgeY, judgeR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 3; ctx.stroke();
      });
      for (var i = notes.length - 1; i >= 0; i--) {
        var n = notes[i];
        n.y = judgeY - (n.hitTime - now) * 0.42;
        if (now > n.hitTime + 160) { notes.splice(i, 1); miss++; continue; }
        if (n.y < -40) continue;
        var gr2 = ctx.createRadialGradient(n.x - 6, n.y - 6, 4, n.x, n.y, 22);
        gr2.addColorStop(0, '#fff'); gr2.addColorStop(1, n.c);
        ctx.beginPath(); ctx.arc(n.x, n.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = gr2; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2; ctx.stroke();
      }
      ctx.fillStyle = 'rgba(18,48,85,.85)';
      ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('分 ' + score + ' · 完美 ' + perfect, 12, 12);
    }

    function judge(lane) {
      if (!playing) return;
      var now = performance.now(), best = null, bd = 1e9;
      notes.forEach(function (n) { if (n.lane !== lane) return; var d = Math.abs(n.hitTime - now); if (d < bd) { bd = d; best = n; } });
      if (!best || bd > 260) { api.miss(); miss++; return; }
      notes.splice(notes.indexOf(best), 1);
      var r = cv.getBoundingClientRect();
      if (bd < 90) { perfect++; score += 3; api.gain(3, r.left + best.x, r.top + judgeY, '完美'); }
      else { score += 1; api.gain(1, r.left + best.x, r.top + judgeY, '不错'); }
    }

    cv.addEventListener('pointerdown', function (ev) {
      var r = cv.getBoundingClientRect();
      var px = ev.clientX - r.left;
      var lane = 0, bd = 1e9;
      laneX.forEach(function (x, i) { var d = Math.abs(px - x); if (d < bd) { bd = d; lane = i; } });
      judge(lane);
    });

    box.querySelector('#start').onclick = function () {
      notes = []; playing = true; t0 = performance.now(); nextSpawn = 0;
      score = perfect = miss = 0;
      box.querySelector('#hint').textContent = '音符到圈里点一下';
      loop();
      setTimeout(function () {
        playing = false;
        box.querySelector('#hint').textContent = '结束！分 ' + score + ' · 完美 ' + perfect + ' · 漏 ' + miss;
        var r = cv.getBoundingClientRect();
        api.gain(Math.max(1, Math.floor(score / 4)), r.left + r.width / 2, r.top + r.height / 2, '收尾');
      }, 20000);
    };

    sizeCanvas();
    ctx.fillStyle = 'rgba(18,48,85,.6)'; ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('按开始', SIDE / 2, SIDE / 2);

    if (g.OMNI_LAYOUT) g.OMNI_LAYOUT.on(function () { sizeCanvas(); if (!playing) { ctx.fillStyle = 'rgba(18,48,85,.6)'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('按开始', SIDE / 2, SIDE / 2); } });
    window.addEventListener('resize', sizeCanvas, { passive: true });
  };
})(window);
