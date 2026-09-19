/* 课程动画：进位加法 / 退位减法 / 表内乘法 / 长度单位 / 角的初步认识 */
(function () {
  var E = window.Engine;
  var clamp = E.clamp, lerp = E.lerp;

  /* 通用：画天空背景 */
  function skyBg(ctx, W, H, t, theme) {
    theme = theme || {};
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, theme.top || '#DCF1FF');
    g.addColorStop(0.55, theme.mid || '#F2FBFF');
    g.addColorStop(1, theme.bot || '#FFF9E6');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    /* 太阳 */
    ctx.save();
    var sunX = W * 0.90, sunY = H * 0.12;
    var sunR = Math.min(W, H) * 0.055;
    var sg = ctx.createRadialGradient(sunX - sunR * 0.3, sunY - sunR * 0.3, sunR * 0.2, sunX, sunY, sunR * 1.8);
    sg.addColorStop(0, 'rgba(255,244,184,.95)');
    sg.addColorStop(0.5, 'rgba(255,217,61,.55)');
    sg.addColorStop(1, 'rgba(255,217,61,0)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.arc(sunX, sunY, sunR * 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    /* 云朵 */
    for (var i = 0; i < 3; i++) {
      var cx = ((t * (12 + i * 6) + i * W * 0.42) % (W + 220)) - 110;
      var cy = H * (0.08 + i * 0.08);
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 44, 19, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 28, cy - 8, 32, 16, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - 28, cy + 3, 28, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /* 远山 */
    ctx.save();
    ctx.fillStyle = theme.hill || 'rgba(184,237,168,.55)';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.86);
    ctx.quadraticCurveTo(W * 0.18, H * 0.70, W * 0.36, H * 0.84);
    ctx.quadraticCurveTo(W * 0.54, H * 0.68, W * 0.72, H * 0.84);
    ctx.quadraticCurveTo(W * 0.88, H * 0.72, W, H * 0.84);
    ctx.lineTo(W, H); ctx.lineTo(0, H);
    ctx.closePath(); ctx.fill();
    ctx.restore();

    /* 草地 */
    ctx.fillStyle = theme.grass || '#C9F0C0';
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, H - 44);
    for (var x = 0; x <= W; x += 40) {
      ctx.quadraticCurveTo(x + 20, H - 60, x + 40, H - 44);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();

    /* 持续动效层：让画面一直在动 */
    if (theme.lively !== false) {
      var lsc = Math.min(W, H) / 620;
      /* 飘动的小气球 */
      for (var b2 = 0; b2 < 2; b2++) {
        var bx2 = W * (0.14 + b2 * 0.72) + Math.sin(t * 0.5 + b2 * 2) * W * 0.035;
        var by2 = H * (0.30 + b2 * 0.10) + Math.sin(t * 0.9 + b2) * H * 0.035;
        ctx.save();
        ctx.globalAlpha = 0.55;
        E.balloon(ctx, bx2, by2, lsc * 0.5, b2 ? '#C79BF5' : '#FF9BB8');
        ctx.restore();
      }
      /* 飞鸟 */
      var birdX = ((t * 40) % (W + 160)) - 80;
      ctx.save();
      ctx.globalAlpha = 0.7;
      E.bird(ctx, birdX, H * 0.15 + Math.sin(t * 1.6) * 12, lsc * 0.7, t);
      ctx.restore();
      /* 草地摇摆的小花 */
      for (var f2 = 0; f2 < 5; f2++) {
        var fx = W * (0.08 + f2 * 0.21);
        var fy = H - 26;
        var sw = Math.sin(t * 2.2 + f2 * 1.3) * 0.35;
        ctx.save();
        ctx.translate(fx, fy);
        ctx.rotate(sw);
        ctx.font = Math.round(16 * lsc) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(['🌼', '🌷', '🌸', '🌻', '🌱'][f2], 0, 0);
        ctx.restore();
      }
      /* 闪烁小星 */
      for (var s2 = 0; s2 < 3; s2++) {
        var sxp = W * (0.22 + s2 * 0.28);
        var syp = H * (0.10 + (s2 % 2) * 0.06);
        var tw = (Math.sin(t * 3 + s2 * 2) + 1) / 2;
        ctx.save();
        ctx.globalAlpha = 0.25 + tw * 0.5;
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath();
        var rr = 4 * lsc + tw * 3 * lsc;
        ctx.arc(sxp, syp, rr, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    /* 装饰物件（可关） */
    if (theme.deco !== false) {
      var deco = theme.decoSet || 'park';
      var sc = Math.min(W, H) / 620;
      if (deco === 'park') {
        E.tree(ctx, W * 0.06, H - 40, sc * 0.85);
        E.bush(ctx, W * 0.94, H - 42, sc * 0.9);
        E.butterfly(ctx, W * 0.72, H * 0.28 + Math.sin(t * 1.2) * 14, sc * 0.8, t);
      } else if (deco === 'farm') {
        E.tree(ctx, W * 0.05, H - 40, sc * 0.8);
        E.carrot(ctx, W * 0.93, H - 46, sc * 0.9);
        E.bush(ctx, W * 0.86, H - 42, sc * 0.7);
        E.bird(ctx, W * 0.30 + Math.sin(t * 0.8) * 30, H * 0.18, sc * 0.8, t);
      } else if (deco === 'town') {
        E.house(ctx, W * 0.09, H - 40, sc * 0.85);
        E.tree(ctx, W * 0.93, H - 42, sc * 0.75);
        E.balloon(ctx, W * 0.20 + Math.sin(t * 0.9) * 12, H * 0.22, sc * 0.7, '#FF9BB8');
        E.balloon(ctx, W * 0.28 + Math.sin(t * 0.9 + 1) * 12, H * 0.16, sc * 0.6, '#8FD4F7');
      } else if (deco === 'sky') {
        E.bird(ctx, W * 0.16 + Math.sin(t * 0.7) * 40, H * 0.16, sc * 0.85, t);
        E.bird(ctx, W * 0.24 + Math.sin(t * 0.7 + 2) * 40, H * 0.24, sc * 0.65, t);
        E.butterfly(ctx, W * 0.84, H * 0.34 + Math.sin(t * 1.4) * 16, sc * 0.9, t);
      } else if (deco === 'play') {
        E.balloon(ctx, W * 0.10, H * 0.30, sc * 0.8, '#FFD93D');
        E.balloon(ctx, W * 0.88, H * 0.26, sc * 0.7, '#C79BF5');
        E.butterfly(ctx, W * 0.60, H * 0.22 + Math.sin(t * 1.3) * 18, sc * 0.85, t);
        E.bush(ctx, W * 0.50, H - 42, sc * 0.65);
      }
    }
  }

  /* 在画布顶部绘制步骤说明（与 DOM 浮层同步，截图可见） */
  function drawStepLabel(ctx, W, H, tl) {
    if (!tl || !tl.currentLabel) return;
    var txt = tl.currentLabel();
    if (!txt) return;
    ctx.save();
    ctx.textAlign = 'center';
    var fs = Math.round(Math.min(W * 0.042, 26));
    ctx.font = '900 ' + fs + 'px "PingFang SC",sans-serif';
    var tw = ctx.measureText(txt).width;
    var padX = fs * 0.9, padY = fs * 0.55;
    var bw = tw + padX * 2, bh = fs + padY * 2;
    var bx = W * 0.5 - bw / 2, by = H - bh - Math.min(H * 0.03, 18);
    ctx.globalAlpha = 0.94;
    E.roundRect(ctx, bx, by, bw, bh, bh / 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,159,67,.85)';
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#3D2E22';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, W * 0.5, by + bh / 2 + 1);
    ctx.restore();
  }

  /* =======================================================
     1. 进位加法：28 + 5  ->  满十进一
     ======================================================= */
  function carryLesson(opt) {
    opt = opt || {};
    var A1 = opt.a || 28;
    var B1 = opt.b || 5;
    var SUM = A1 + B1;
    var tensN = Math.floor(A1 / 10);
    var onesA = A1 % 10;

    var tl = new E.Timeline();
    var bundleT = 0;
    var moveT = 0;
    var newBundleT = 0;
    var tenMade = false;

    function say(txt) { return txt; }

    tl.push(0.1, function () {}, { ease: 'linear', say: A1 + '加' + B1 });
    tl.push(1.0, function (e) { bundleT = e; },
      { ease: 'outBack', say: tensN + '捆十根，再加' + onesA + '根' });
    tl.push(1.0, function (e) { moveT = e; },
      { ease: 'outCubic', say: '加' + B1 + '根' });
    tl.push(1.2, function (e) {
      newBundleT = e;
      if (e > 0.5 && !tenMade) { tenMade = true; if (window.Audio2) window.Audio2.sfx('pop'); }
    }, { ease: 'outCubic', say: onesA + '加' + B1 + '，凑成十根' });
    tl.push(1.3, function (e) {
      newBundleT = 1 + e;
    }, { ease: 'outElastic', say: '满十进一', label: '满十进一' });
    tl.push(1.0, function () {},
      { ease: 'outCubic', say: A1 + '加' + B1 + '，等于' + SUM });

    function draw(ctx, W, H, t) {
      skyBg(ctx, W, H, t, { decoSet: 'farm', grass: '#C4EEB4' });

      var baseY = H * 0.78;
      var stickW = Math.max(9, Math.min(W * 0.026, 26));
      var stickH = Math.min(120, H * 0.28);
      var gap = stickW * 1.9;
      var sc = Math.min(W, H) / 620;

      /* 整体弹跳：成捆瞬间有回弹 */
      var bounce = 0;
      if (newBundleT > 1 && newBundleT < 2) {
        var bt = newBundleT - 1;
        bounce = Math.sin(bt * Math.PI) * H * 0.06;
      }

      /* --- 已捆好的整捆 --- */
      var bundleShow = clamp(bundleT, 0, 1);
      for (var b = 0; b < tensN; b++) {
        var bx = W * 0.10 + b * (stickW * 4.6);
        ctx.save();
        ctx.globalAlpha = 0.35 + 0.65 * bundleShow;
        for (var i = 0; i < 10; i++) {
          E.stick(ctx, bx + i * (stickW * 0.66), baseY, stickW * 0.60, stickH,
                  i % 2 ? '#8FD98F' : '#5CC44A', true);
        }
        ctx.strokeStyle = '#FF9BB8';
        ctx.lineWidth = Math.max(3, stickW * 0.4);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(bx - stickW * 0.45, baseY - stickH * 0.62);
        ctx.lineTo(bx + stickW * 4.3, baseY - stickH * 0.62);
        ctx.stroke();
        ctx.restore();
      }

      /* --- 个位散棒 --- */
      var looseStartX = W * 0.10 + tensN * (stickW * 4.6) + stickW * 1.6;
      var remain = Math.max(0, onesA - (newBundleT > 0.5 ? 10 - B1 : 0));
      if (remain < 0) remain = 0;
      for (var j = 0; j < remain; j++) {
        E.stick(ctx, looseStartX + j * gap, baseY, stickW * 0.66, stickH, '#FFA74D', true);
      }

      /* --- 飞入的新棒 --- */
      var showIn = Math.round(clamp(moveT, 0, 1) * B1);
      for (var k = 0; k < showIn; k++) {
        var pp = clamp(moveT * B1 - k, 0, 1);
        var fromX = W * 1.06;
        var toX = looseStartX + (remain + k) * gap;
        var x = lerp(fromX, toX, pp);
        var yOff = Math.sin(pp * Math.PI) * (-H * 0.34);
        ctx.save();
        ctx.globalAlpha = 0.95;
        E.stick(ctx, x, baseY + yOff, stickW * 0.66, stickH, '#7EC8F5', true);
        ctx.restore();
      }

      /* --- 进位产生的新捆 --- */
      var nb = clamp(newBundleT - 1, 0, 1);
      if (nb > 0.01) {
        var nx = W * 0.10 + tensN * (stickW * 4.6);
        ctx.save();
        ctx.globalAlpha = nb;
        var scl = 0.35 + 0.65 * E.ease.outElastic(nb);
        ctx.translate(nx + stickW * 2.1, baseY - stickH * 0.5 - bounce);
        ctx.scale(scl, scl);
        ctx.translate(-(nx + stickW * 2.1), -(baseY - stickH * 0.5 - bounce));
        for (var m = 0; m < 10; m++) {
          E.stick(ctx, nx + m * (stickW * 0.66), baseY, stickW * 0.60, stickH,
                  m % 2 ? '#FFC6D9' : '#FF6E96', true);
        }
        ctx.strokeStyle = '#4AA8E0';
        ctx.lineWidth = Math.max(3, stickW * 0.4);
        ctx.beginPath();
        ctx.moveTo(nx - stickW * 0.45, baseY - stickH * 0.62);
        ctx.lineTo(nx + stickW * 4.3, baseY - stickH * 0.62);
        ctx.stroke();
        ctx.restore();
        /* 光晕 */
        ctx.save();
        ctx.globalAlpha = nb * 0.5 * (0.6 + 0.4 * Math.sin(t * 6));
        ctx.beginPath();
        ctx.arc(nx + stickW * 2.0, baseY - stickH * 0.5, stickW * 4.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,217,61,.6)';
        ctx.fill();
        ctx.restore();
      }

      /* --- 算式 --- */
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '900 ' + Math.round(Math.min(W * 0.072, 44)) + 'px "PingFang SC",sans-serif';
      ctx.fillStyle = '#4AA8E0';
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#FFFFFF';
      var pulse = 1 + Math.sin(t * 4) * 0.035;
      ctx.save();
      ctx.translate(W * 0.5, H * 0.15);
      ctx.scale(pulse, pulse);
      ctx.strokeText(A1 + ' + ' + B1 + ' = ' + SUM, 0, 0);
      ctx.fillText(A1 + ' + ' + B1 + ' = ' + SUM, 0, 0);
      ctx.restore();
      ctx.restore();

      if (nb > 0.15) {
        ctx.save();
        var pa = clamp((nb - 0.15) * 1.6, 0, 1);
        var psc = 0.4 + 0.6 * E.ease.outElastic(pa);
        ctx.globalAlpha = pa;
        ctx.translate(W * 0.5, H * 0.30);
        ctx.scale(psc, psc);
        ctx.textAlign = 'center';
        ctx.font = '900 ' + Math.round(Math.min(W * 0.085, 52)) + 'px "PingFang SC",sans-serif';
        ctx.lineWidth = 9; ctx.strokeStyle = '#FFF';
        ctx.strokeText('满十进一', 0, 0);
        ctx.fillStyle = '#FF6E96';
        ctx.fillText('满十进一', 0, 0);
        ctx.restore();
      }

      /* 助教 */
      E.kitty(ctx, W * 0.88, H * 0.80, sc * 1.0);
    }

    function reroll() {
      var a, b;
      do {
        a = 11 + Math.floor(Math.random() * 78);
        b = 2 + Math.floor(Math.random() * 8);
      } while ((a % 10) + b < 10 || a + b > 100);
      var fresh = carryLesson({ a: a, b: b });
      if (window.__swapLesson) window.__swapLesson(fresh);
    }

    return { tl: tl, draw: draw, steps: 6, name: '进位加法', py: 'jìn wèi jiā fǎ', reroll: reroll };
  }

  /* =======================================================
     2. 退位减法：32 - 7  ->  借一当十
     ======================================================= */
  function borrowLesson(opt) {
    opt = opt || {};
    var A2 = opt.a || 32;
    var B2 = opt.b || 7;
    var RES = A2 - B2;
    var tensA = Math.floor(A2 / 10);
    var onesA = A2 % 10;
    var tl = new E.Timeline();
    var t0 = 0, openT = 0, takeT = 0, resultT = 0;

    tl.push(0.1, function () {}, { ease: 'linear', say: A2 + '减' + B2 });
    tl.push(1.0, function (e) { t0 = e; }, { ease: 'outBack', say: tensA + '捆十根，再加' + onesA + '根' });
    tl.push(1.1, function (e) { openT = e; }, { ease: 'outCubic', say: '个位不够减，解开一捆', label: '个位不够减，解开一捆' });
    tl.push(1.1, function (e) { takeT = e; }, { ease: 'outCubic', say: '拿走' + B2 + '根' });
    tl.push(1.0, function (e) { resultT = e; }, { ease: 'outCubic', say: A2 + '减' + B2 + '，等于' + RES });

    function draw(ctx, W, H, t, dt) {
      skyBg(ctx, W, H, t, { decoSet: 'park', grass: '#BFEAAF' });
      var baseY = H * 0.72;
      var stickW = Math.max(7, W * 0.016);
      var stickH = Math.min(64, H * 0.16);
      var gap = stickW * 1.85;

      /* 整捆（最后一捆会被解开） */
      var bundlesAlive = tensA - (openT > 0 ? 1 : 0);
      for (var b = 0; b < tensA; b++) {
        var bx = W * 0.14 + b * (stickW * 4.2);
        if (b === tensA - 1) {
          /* 这一捆会被解开 */
          var op = clamp(openT, 0, 1);
          if (op < 0.99) {
            ctx.save();
            ctx.globalAlpha = 1 - op * 0.55;
            for (var i = 0; i < 10; i++) {
              var spread = op * i * (gap - stickW * 0.62);
              E.stick(ctx, bx + i * (stickW * 0.62) + spread, baseY, stickW * 0.62, stickH,
                      i % 2 ? '#FFC6D9' : '#FF9DBB', true);
            }
            if (op < 0.35) {
              ctx.strokeStyle = '#FF9DBB';
              ctx.lineWidth = Math.max(3, stickW * 0.36);
              ctx.globalAlpha = 1 - op / 0.35;
              ctx.beginPath();
              ctx.moveTo(bx - stickW * 0.4, baseY - stickH * 0.62);
              ctx.lineTo(bx + stickW * 4.0, baseY - stickH * 0.62);
              ctx.stroke();
            }
            ctx.restore();
          }
        } else {
          ctx.save();
          ctx.globalAlpha = 0.35 + 0.65 * clamp(t0, 0, 1);
          for (var q = 0; q < 10; q++) {
            E.stick(ctx, bx + q * (stickW * 0.62), baseY, stickW * 0.56, stickH,
                    q % 2 ? '#8FD98F' : '#7ECB6F', true);
          }
          ctx.strokeStyle = '#FF9DBB';
          ctx.lineWidth = Math.max(3, stickW * 0.36);
          ctx.beginPath();
          ctx.moveTo(bx - stickW * 0.4, baseY - stickH * 0.62);
          ctx.lineTo(bx + stickW * 4.0, baseY - stickH * 0.62);
          ctx.stroke();
          ctx.restore();
        }
      }

      /* 原来的 2 根 + 解开的 10 根，被拿走的 7 根 */
      var looseX = W * 0.14 + 2 * (stickW * 4.2) + stickW * 1.2;
      var totalLoose = onesA + (openT > 0 ? 10 : 0);
      var takenCount = Math.round(B2 * clamp(takeT, 0, 1));
      for (var s = 0; s < totalLoose; s++) {
        var isTaken = s < takenCount;
        var sx = looseX + s * gap;
        var sy = baseY;
        var alpha = 1;
        if (isTaken) {
          var tp = clamp(takeT * B2 - s, 0, 1);
          sx = lerp(sx, W * 0.9, tp);
          sy = baseY + Math.sin(tp * Math.PI) * (-H * 0.2);
          alpha = 1 - tp * 0.85;
        }
        ctx.save();
        ctx.globalAlpha = alpha;
        E.stick(ctx, sx, sy, stickW * 0.62, stickH, isTaken ? '#CCCCCC' : '#FFB74D', true);
        ctx.restore();
      }

      /* 结果提示 */
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '700 ' + Math.round(Math.min(W * 0.062, 34)) + 'px "PingFang SC",sans-serif';
      ctx.fillStyle = '#4A90C2';
      ctx.fillText(A2 + ' − ' + B2 + ' = ' + RES, W * 0.5, H * 0.16);
      if (resultT > 0.3) {
        ctx.globalAlpha = clamp((resultT - 0.3) * 1.6, 0, 1);
        ctx.font = '700 ' + Math.round(Math.min(W * 0.05, 26)) + 'px "PingFang SC",sans-serif';
        ctx.fillStyle = '#FF9F43';
        ctx.fillText('借一当十', W * 0.5, H * 0.30);
      }
      ctx.restore();

      /* 借位箭头 */
      if (openT > 0.4) {
        ctx.save();
        ctx.globalAlpha = clamp((openT - 0.4) * 2, 0, 1) * (0.6 + 0.4 * Math.sin(t * 5));
        ctx.strokeStyle = '#FF9F43';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        var ax1 = W * 0.14 + 2 * (stickW * 4.2) + stickW * 1.8;
        var ax2 = W * 0.14 + stickW * 8.0;
        ctx.beginPath();
        ctx.moveTo(ax2, H * 0.40);
        ctx.quadraticCurveTo((ax1 + ax2) / 2, H * 0.30, ax1, H * 0.44);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ax1, H * 0.44);
        ctx.lineTo(ax1 - 9, H * 0.40);
        ctx.moveTo(ax1, H * 0.44);
        ctx.lineTo(ax1 - 5, H * 0.485);
        ctx.stroke();
        ctx.restore();
      }
    }

    function reroll() {
      var a, b;
      do {
        a = 21 + Math.floor(Math.random() * 70);
        b = 2 + Math.floor(Math.random() * 8);
      } while ((a % 10) >= b || a - b < 10);
      var fresh = borrowLesson({ a: a, b: b });
      if (window.__swapLesson) window.__swapLesson(fresh);
    }

    return { tl: tl, draw: draw, steps: 5, name: '退位减法', py: 'tuì wèi jiǎn fǎ', reroll: reroll };
  }

  /* =======================================================
     3. 表内乘法：3 × 4  ->  阵列
     ======================================================= */
  function multiplyLesson(opt) {
    opt = opt || {};
    var MR = opt.r || 3;
    var MC = opt.c || 4;
    var PROD = MR * MC;
    var tl = new E.Timeline();
    var rows = 0, cols = 0, flash = 0;

    tl.push(0.1, function () {}, { ease: 'linear', say: MR + '乘' + MC });
    tl.push(1.0, function (e) { rows = e / MR; }, { ease: 'outCubic', say: '第一行，' + MC + '个' });
    tl.push(1.0, function (e) { rows = 1 / MR; cols = e; }, { ease: 'outCubic', say: '第二行', label: '第二行' });
    tl.push(1.0, function (e) { rows = 2 / MR; cols = 0.5 + e * 0.5; }, { ease: 'outCubic', say: '第三行', label: '第三行' });
    tl.push(1.0, function (e) { rows = 1; cols = 1; flash = e; },
      { ease: 'outElastic', say: MR + '行' + MC + '列，一共' + PROD + '个' });

    function draw(ctx, W, H, t, dt) {
      skyBg(ctx, W, H, t, { decoSet: 'play', grass: '#C9F0C0' });
      var cx = W * 0.5, cy = H * 0.56;
      var sp = Math.min(W * 0.14, H * 0.17);
      var R = sp * 0.28;
      var colors = ['#FF9DBB', '#8ECAE6', '#FFD166', '#8FD98F'];

      var shownRows = Math.round(rows * MR);
      var shownCols = Math.round(clamp(cols, 0, 1) * MC);
      if (shownRows > 0 && shownCols === 0) shownCols = MC;

      var startX = cx - sp * (MC - 1) * 0.5;
      var startY = cy - sp * (MR - 1) * 0.5;

      for (var r = 0; r < shownRows; r++) {
        for (var c = 0; c < shownCols; c++) {
          var px = startX + c * sp;
          var py = startY + r * sp;
          var appear = clamp(rows * MR - r, 0, 1);
          var pop = 0.75 + 0.25 * E.ease.outBack(clamp(appear, 0, 1));
          ctx.save();
          ctx.globalAlpha = appear;
          E.dot(ctx, px, py, R * pop, colors[(r + c) % 4]);
          ctx.restore();
        }
      }

      /* 行标注 */
      for (var rr = 0; rr < shownRows; rr++) {
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#8B7355';
        ctx.font = '700 ' + Math.round(R * 0.95) + 'px "PingFang SC",sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('第' + (rr + 1) + '行', startX - R * 1.5, startY + rr * sp + R * 0.35);
        ctx.restore();
      }
      /* 列标注 */
      for (var cc = 0; cc < shownCols; cc++) {
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#8B7355';
        ctx.font = '700 ' + Math.round(R * 0.9) + 'px "PingFang SC",sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(cc + 1), startX + cc * sp, startY - R * 1.7);
        ctx.restore();
      }

      /* 公式 */
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '700 ' + Math.round(Math.min(W * 0.062, 34)) + 'px "PingFang SC",sans-serif';
      ctx.fillStyle = '#4A90C2';
      ctx.fillText(MR + ' × ' + MC + ' = ' + PROD, W * 0.5, H * 0.16);
      ctx.restore();

      /* 高亮扫描 */
      if (flash > 0.2) {
        ctx.save();
        ctx.globalAlpha = clamp((flash - 0.2) * 1.5, 0, 1) * 0.5;
        ctx.strokeStyle = '#FF9F43';
        ctx.lineWidth = 5;
        E.roundRect(ctx, startX - sp * 0.5, startY - sp * 0.5,
                    sp * (shownCols - 1) + sp, sp * (shownRows - 1) + sp, 18);
        ctx.stroke();
        ctx.restore();
      }

      /* 小老师 */
      E.kitty(ctx, W * 0.90, H * 0.80, Math.min(W, H) / 560);
    }

    function reroll() {
      var r = 2 + Math.floor(Math.random() * 7);
      var c = 2 + Math.floor(Math.random() * 8);
      var fresh = multiplyLesson({ r: r, c: c });
      if (window.__swapLesson) window.__swapLesson(fresh);
    }

    return { tl: tl, draw: draw, steps: 5, name: '表内乘法', py: 'biǎo nèi chéng fǎ', reroll: reroll };
  }

  /* =======================================================
     4. 长度单位：厘米
     ======================================================= */
  function lengthLesson(opt) {
    opt = opt || {};
    var tl = new E.Timeline();
    var rulerT = 0, objT = 0, numT = 0;
    var measLen = opt.len || 6;

    tl.push(0.1, function () {}, { ease: 'linear', say: '长度单位，厘米', label: '长度单位，厘米' });
    tl.push(1.0, function (e) { rulerT = e; }, { ease: 'outCubic', say: '这是尺子', label: '这是尺子' });
    tl.push(1.2, function (e) { objT = e; }, { ease: 'outBack', say: '小棒从零开始', label: '小棒从零开始' });
    tl.push(1.0, function (e) { numT = e; }, { ease: 'outCubic', say: '长六厘米', label: '长六厘米' });

    function draw(ctx, W, H, t, dt) {
      skyBg(ctx, W, H, t, { decoSet: 'town', grass: '#C9F0C0' });

      var rulerY = H * 0.62;
      var rulerH = Math.min(78, H * 0.17);
      var x0 = W * 0.08, x1 = W * 0.92;
      var totalCm = 10;
      var pxPerCm = (x1 - x0) / totalCm;

      /* 尺身 */
      ctx.save();
      ctx.globalAlpha = clamp(rulerT * 2, 0, 1);
      var g = ctx.createLinearGradient(0, rulerY, 0, rulerY + rulerH);
      g.addColorStop(0, '#FFE7A8');
      g.addColorStop(1, '#FFD166');
      E.roundRect(ctx, x0, rulerY, x1 - x0, rulerH, 14);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#E8B93C';
      ctx.stroke();

      /* 刻度 */
      for (var i = 0; i <= totalCm * 2; i++) {
        var px = x0 + i * pxPerCm / 2;
        var isCm = i % 2 === 0;
        var hh = isCm ? rulerH * 0.48 : rulerH * 0.26;
        ctx.beginPath();
        ctx.moveTo(px, rulerY);
        ctx.lineTo(px, rulerY + hh);
        ctx.strokeStyle = isCm ? '#B98A5A' : '#D8B77A';
        ctx.lineWidth = isCm ? 2.6 : 1.6;
        ctx.stroke();
        if (isCm) {
          ctx.fillStyle = '#8B7355';
          ctx.font = '700 ' + Math.round(rulerH * 0.32) + 'px "PingFang SC",sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(String(i / 2), px, rulerY + rulerH * 0.86);
        }
      }
      ctx.restore();

      /* 被测小棒 */
      var p = clamp(objT, 0, 1);
      var len = measLen * pxPerCm;
      var objY = rulerY - 26;
      var objX = lerp(W * 0.95, x0, p);
      ctx.save();
      ctx.globalAlpha = clamp(objT * 1.6, 0, 1);
      E.stick(ctx, objX + len / 2, objY, Math.max(14, pxPerCm * 0.5), Math.max(20, rulerH * 0.46), '#FF9DBB', true);
      ctx.restore();

      /* 测量标注 */
      if (numT > 0.25) {
        ctx.save();
        ctx.globalAlpha = clamp((numT - 0.25) * 1.6, 0, 1);
        ctx.strokeStyle = '#FF9F43';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(x0, rulerY - 46);
        ctx.lineTo(x0 + len, rulerY - 46);
        ctx.stroke();
        ctx.setLineDash([]);
        /* 端点竖线 */
        [x0, x0 + len].forEach(function (vx) {
          ctx.beginPath();
          ctx.moveTo(vx, rulerY - 58);
          ctx.lineTo(vx, rulerY - 34);
          ctx.stroke();
        });
        ctx.textAlign = 'center';
        ctx.font = '800 ' + Math.round(Math.min(W * 0.058, 32)) + 'px "PingFang SC",sans-serif';
        ctx.fillStyle = '#FF9F43';
        ctx.fillText(measLen + ' 厘米', x0 + len / 2, rulerY - 70);
        ctx.restore();
      }

      /* 顶部提示 */
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '700 ' + Math.round(Math.min(W * 0.05, 28)) + 'px "PingFang SC",sans-serif';
      ctx.fillStyle = '#4A90C2';
      ctx.fillText('1 厘米  ≈  指甲盖宽', W * 0.5, H * 0.16);
      ctx.restore();
    }

    function reroll() {
      if (window.__swapLesson) window.__swapLesson(lengthLesson({ len: 3 + Math.floor(Math.random() * 8) }));
    }

    return { tl: tl, draw: draw, steps: 4, name: '长度单位', py: 'cháng dù dān wèi', reroll: reroll };
  }

  /* =======================================================
     5. 角的初步认识
     ======================================================= */
  function angleLesson() {
    var tl = new E.Timeline();
    var arm1 = 0, arm2 = 0, markT = 0;

    tl.push(0.1, function () {}, { ease: 'linear', say: '角的初步认识', label: '角的初步认识' });
    tl.push(1.0, function (e) { arm1 = e; }, { ease: 'outCubic', say: '一条边', label: '一条边' });
    tl.push(1.0, function (e) { arm2 = e; }, { ease: 'outCubic', say: '再画一条边', label: '再画一条边' });
    tl.push(1.0, function (e) { markT = e; }, { ease: 'outElastic', say: '这就是角', label: '这就是角' });

    function draw(ctx, W, H, t, dt) {
      skyBg(ctx, W, H, t, { decoSet: 'sky', grass: '#C9F0C0' });
      var vx = W * 0.44, vy = H * 0.60;
      var L = Math.min(W * 0.30, H * 0.34);

      /* 顶点 */
      ctx.save();
      ctx.beginPath();
      ctx.arc(vx, vy, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#FF9F43';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      /* 第一条边：水平向右 */
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#4FA8D8';
      ctx.lineWidth = Math.max(9, L * 0.055);
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.lineTo(vx + L * clamp(arm1, 0, 1), vy);
      ctx.stroke();
      ctx.restore();

      /* 第二条边：旋转 */
      var a2 = clamp(arm2, 0, 1) * (-58 * Math.PI / 180);
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#E8748F';
      ctx.lineWidth = Math.max(9, L * 0.055);
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.lineTo(vx + Math.cos(a2) * L * clamp(arm2, 0, 1),
                 vy + Math.sin(a2) * L * clamp(arm2, 0, 1));
      ctx.stroke();
      ctx.restore();

      /* 角的弧线标记 */
      if (markT > 0.15) {
        ctx.save();
        ctx.globalAlpha = clamp((markT - 0.15) * 1.8, 0, 1);
        ctx.strokeStyle = '#FFD166';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(vx, vy, L * 0.32 * clamp(markT, 0.3, 1), a2, 0);
        ctx.stroke();

        /* 直角标记 */
        var rx = vx + L * 0.16, ry = vy - L * 0.16;
        ctx.globalAlpha = clamp((markT - 0.5) * 2, 0, 1);
        ctx.strokeStyle = '#8FD98F';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(vx + L * 0.16, vy);
        ctx.lineTo(vx + L * 0.16, ry);
        ctx.lineTo(vx, ry);
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.font = '800 ' + Math.round(Math.min(W * 0.055, 30)) + 'px "PingFang SC",sans-serif';
        ctx.fillStyle = '#E8748F';
        ctx.fillText('角', vx + L * 0.42, vy - L * 0.30);
        ctx.restore();
      }

      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '700 ' + Math.round(Math.min(W * 0.05, 28)) + 'px "PingFang SC",sans-serif';
      ctx.fillStyle = '#4A90C2';
      ctx.fillText('一个顶点 · 两条边', W * 0.5, H * 0.16);
      ctx.restore();

      E.kitty(ctx, W * 0.88, H * 0.80, Math.min(W, H) / 560);
    }

    
    function reroll() {
      if (window.__swapLesson) window.__swapLesson(angleLesson());
    }
    return { tl: tl, draw: draw, steps: 4, name: '角的初步认识', py: 'jiǎo de chū bù rèn shi' , reroll: reroll };
  }


  /* =======================================================
     6. 100以内加法（不进位）：34 + 23  ->  数位对齐
     ======================================================= */
  function addNoCarry(opt) {
    opt = opt || {};
    var A = opt.a || 34;
    var B = opt.b || 23;
    var S = A + B;
    var aT = String(A), bT = String(B), sT = String(S);
    while (aT.length < 2) aT = ' ' + aT;
    while (bT.length < 2) bT = ' ' + bT;
    while (sT.length < 2) sT = ' ' + sT;

    var tl = new E.Timeline();
    var t1 = 0, t2 = 0, dropT = 0, sumT = 0;

    tl.push(0.1, function () {}, { ease: 'linear', say: A + '加' + B });
    tl.push(1.3, function (e) { t1 = e; },
      { ease: 'outBack', say: '十位对十位，个位对个位', label: '十位对十位，个位对个位' });
    tl.push(1.4, function (e) { t2 = e; },
      { ease: 'outCubic', say: '先算个位，' + (A % 10) + '加' + (B % 10) + '等于' + (S % 10) });
    tl.push(1.3, function (e) { dropT = e; },
      { ease: 'outCubic', say: '再算十位', label: '再算十位' });
    tl.push(1.1, function (e) { sumT = e; },
      { ease: 'outElastic', say: A + '加' + B + '等于' + S });

    function draw(ctx, W, H, t) {
      skyBg(ctx, W, H, t, { decoSet: 'town', grass: '#C9F0C0' });

      var sc = Math.min(W, H) / 620;
      var cx = W * 0.46;
      var topY = H * 0.24;
      var cellW = Math.min(W * 0.22, 170);
      var cellH = Math.min(H * 0.20, 116);
      var gapX = cellW + 12;
      var gapY = cellH + 10;

      /* 数位表头 */
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '900 ' + Math.round(Math.min(W * 0.045, 26)) + 'px "PingFang SC",sans-serif';
      ctx.fillStyle = '#8A7059';
      ctx.fillText('十位', cx - gapX * 0.5, topY - 16);
      ctx.fillText('个位', cx + gapX * 0.5, topY - 16);
      ctx.restore();

      /* 格子 */
      ctx.save();
      ctx.lineWidth = 3;
      for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 2; c++) {
          var bx = cx + (c - 0.5) * gapX - cellW / 2;
          var by = topY + r * gapY;
          E.roundRect(ctx, bx, by, cellW, cellH, 12);
          ctx.strokeStyle = '#E0D0B8';
          ctx.fillStyle = r === 2 ? 'rgba(200,240,190,.45)' : 'rgba(255,255,255,.85)';
          ctx.fill(); ctx.stroke();
        }
      }
      ctx.restore();

      /* 数字绘制：带下落动画 */
      function put(ch, col, row, prog, color, delay) {
        if (prog <= 0 || ch === ' ') return;
        var p2 = E.clamp((prog - delay) / (1 - delay || 1), 0, 1);
        if (p2 <= 0) return;
        var ease = E.ease.outBack(p2);
        var bx = cx + (col - 0.5) * gapX;
        var by = topY + row * gapY + cellH * 0.5;
        ctx.save();
        ctx.globalAlpha = Math.min(1, p2 * 2);
        /* 从斜上方飞入 + 由小变大 */
        var dropY = (1 - ease) * -cellH * 2.2;
        var slideX = (1 - ease) * (col === 0 ? -W * 0.30 : W * 0.30);
        ctx.translate(bx + slideX, by + dropY);
        var sc2 = 0.25 + 0.75 * Math.min(1.05, ease);
        ctx.scale(sc2, sc2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 ' + Math.round(cellH * 0.78) + 'px "PingFang SC",sans-serif';
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#FFFFFF';
        ctx.strokeText(ch, 0, 0);
        ctx.fillStyle = color;
        ctx.fillText(ch, 0, 0);
        ctx.restore();
        /* 落地光晕 */
        if (p2 > 0.75 && p2 < 0.98) {
          ctx.save();
          ctx.globalAlpha = (0.98 - p2) * 4 * 0.6;
          ctx.beginPath();
          ctx.arc(bx, by, cellW * 0.60, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,217,61,.7)';
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.textBaseline = 'alphabetic';

      /* 第一行：A */
      put(aT[0], 0, 0, t1, '#4AA8E0', 0);
      put(aT[1], 1, 0, t1, '#4AA8E0', 0.25);
      /* 第二行：加号 + B */
      if (t2 > 0.05) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, t2 * 4);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '900 ' + Math.round(cellH * 0.6) + 'px "PingFang SC",sans-serif';
        ctx.fillStyle = '#FF9B2E';
        ctx.fillText('+', cx - gapX * 1.5, topY + gapY + cellH * 0.5);
        ctx.restore();
      }
      put(bT[0], 0, 1, t2, '#FF9B2E', 0);
      put(bT[1], 1, 1, t2, '#FF9B2E', 0.25);

      /* 横线 */
      if (dropT > 0.02) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, dropT * 5);
        var lw = cellW * 2.15 * E.clamp(dropT * 3, 0, 1);
        ctx.strokeStyle = '#FF6E96';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - lw / 2, topY + 2 * gapY - 8);
        ctx.lineTo(cx - lw / 2 + lw, topY + 2 * gapY - 8);
        ctx.stroke();
        ctx.restore();
      }

      /* 第三行：结果 */
      put(sT[0], 0, 2, sumT, '#5CC44A', 0);
      put(sT[1], 1, 2, sumT, '#5CC44A', 0.22);

      /* 结果高亮框 */
      if (sumT > 0.6) {
        ctx.save();
        ctx.globalAlpha = (sumT - 0.6) * 2 * (0.55 + 0.45 * Math.sin(t * 6));
        ctx.strokeStyle = '#5CC44A';
        ctx.lineWidth = 8;
        E.roundRect(ctx, cx - gapX * 1.08, topY + 2 * gapY - 4, gapX * 2.16, cellH + 8, 18);
        ctx.stroke();
        ctx.restore();
      }

      /* 算式条 */
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '900 ' + Math.round(Math.min(W * 0.055, 32)) + 'px "PingFang SC",sans-serif';
      ctx.lineWidth = 6; ctx.strokeStyle = '#FFF';
      var txt = A + ' + ' + B + ' = ' + (sumT > 0.5 ? S : '?');
      ctx.strokeText(txt, W * 0.78, H * 0.20);
      ctx.fillStyle = '#4AA8E0';
      ctx.fillText(txt, W * 0.78, H * 0.20);
      ctx.restore();

      /* 助教 */
      E.kitty(ctx, W * 0.82, H * 0.82, sc * 1.0);
    }

    function reroll() {
      var a, b;
      do {
        a = 12 + Math.floor(Math.random() * 70);
        b = 11 + Math.floor(Math.random() * 70);
      } while ((a % 10) + (b % 10) >= 10 || a + b > 99);
      var fresh = addNoCarry({ a: a, b: b });
      if (window.__swapLesson) window.__swapLesson(fresh);
    }

    return { tl: tl, draw: draw, steps: 5, name: '100以内加法', py: 'yī bǎi yǐ nèi jiā fǎ', reroll: reroll };
  }

  /* =======================================================
     7. 认识时间：分针转一圈 = 60分 = 1小时
     ======================================================= */
  function clockLesson(opt) {
    opt = opt || {};
    var tl = new E.Timeline();
    var faceT = 0, markT = 0, hourT = 0, minT = 0, fullT = 0;
    var hourTarget = opt.hour || 1;

    tl.push(0.1, function () {}, { ease: 'linear', say: '认识时间', label: '认识时间' });
    tl.push(1.0, function (e) { faceT = e; }, { ease: 'outBack', say: '这是钟面', label: '这是钟面' });
    tl.push(1.0, function (e) { markT = e; }, { ease: 'outCubic', say: '有十二个大格，六十个小格', label: '有十二个大格，六十个小格' });
    tl.push(1.2, function (e) { hourT = e; }, { ease: 'outCubic', say: '短针是时针，走得慢', label: '短针是时针，走得慢' });
    tl.push(1.2, function (e) { minT = e; }, { ease: 'outCubic', say: '长针是分针，走一圈', label: '长针是分针，走一圈' });
    tl.push(1.2, function (e) { fullT = e; }, { ease: 'outElastic', say: '分针走一圈，时针走一大格，就是一小时', label: '分针走一圈，时针走一大格，就是一小时' });

    function draw(ctx, W, H, t) {
      skyBg(ctx, W, H, t, { decoSet: 'sky', grass: '#C9F0C0' });

      var cx = W * 0.5, cy = H * 0.52;
      var R = Math.min(W * 0.30, H * 0.34);

      /* 钟面 */
      ctx.save();
      ctx.globalAlpha = clamp(faceT * 2, 0, 1);
      var g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.2, cx, cy, R);
      g.addColorStop(0, '#FFFFFF');
      g.addColorStop(1, '#FFF0C8');
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
      ctx.lineWidth = Math.max(6, R * 0.055);
      ctx.strokeStyle = '#FFD93D'; ctx.stroke();
      ctx.restore();

      /* 刻度 */
      ctx.save();
      ctx.globalAlpha = clamp(markT * 1.5, 0, 1);
      for (var i = 0; i < 60; i++) {
        var isBig = i % 5 === 0;
        var ang = (i / 60) * Math.PI * 2 - Math.PI / 2;
        var r1 = R * (isBig ? 0.80 : 0.88);
        var r2 = R * 0.96;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
        ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2);
        ctx.strokeStyle = isBig ? '#8A7059' : '#D8C8B0';
        ctx.lineWidth = isBig ? Math.max(3, R * 0.028) : Math.max(1.5, R * 0.014);
        ctx.lineCap = 'round';
        ctx.stroke();
        if (isBig) {
          var num = i / 5 === 0 ? 12 : i / 5;
          var nr = R * 0.68;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '900 ' + Math.round(R * 0.16) + 'px "PingFang SC",sans-serif';
          ctx.fillStyle = '#5A4634';
          ctx.fillText(String(num), cx + Math.cos(ang) * nr, cy + Math.sin(ang) * nr);
        }
      }
      ctx.textBaseline = 'alphabetic';
      ctx.restore();

      /* 时针：走1大格 */
      var hourAng = -Math.PI / 2 + (hourT * hourTarget * 30) * Math.PI / 180;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#4AA8E0';
      ctx.lineWidth = Math.max(8, R * 0.075);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(hourAng) * R * 0.48, cy + Math.sin(hourAng) * R * 0.48);
      ctx.stroke();
      ctx.restore();

      /* 分针：转一圈 */
      var minAng = -Math.PI / 2 + (minT * 360) * Math.PI / 180;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#FF6E96';
      ctx.lineWidth = Math.max(6, R * 0.052);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(minAng) * R * 0.74, cy + Math.sin(minAng) * R * 0.74);
      ctx.stroke();
      ctx.restore();

      /* 中心轴 */
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.055, 0, Math.PI * 2);
      ctx.fillStyle = '#FF9B2E'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();

      /* 提示 */
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '900 ' + Math.round(Math.min(W * 0.052, 30)) + 'px "PingFang SC",sans-serif';
      ctx.fillStyle = '#4AA8E0';
      ctx.fillText('1 时 = 60 分', W * 0.5, H * 0.13);
      if (fullT > 0.3) {
        ctx.globalAlpha = clamp((fullT - 0.3) * 1.6, 0, 1);
        ctx.font = '900 ' + Math.round(Math.min(W * 0.046, 26)) + 'px "PingFang SC",sans-serif';
        ctx.fillStyle = '#FF6E96';
        ctx.fillText('分针走一圈 = 1小时', W * 0.5, H * 0.88);
      }
      ctx.restore();
    }

    function reroll() {
      if (window.__swapLesson) window.__swapLesson(clockLesson({ hour: 1 + Math.floor(Math.random() * 11) }));
    }

    return { tl: tl, draw: draw, steps: 6, name: '认识时间', py: 'rèn shi shí jiān', reroll: reroll };
  }

  /* =======================================================
     8. 观察物体：从不同方向看
     ======================================================= */
  function observeLesson(opt) {
    opt = opt || {};
    var tl = new E.Timeline();
    var frontT = 0, sideT = 0, topT = 0, rotateT = 0;
    var shapeMode = opt.mode || 0;

    tl.push(0.1, function () {}, { ease: 'linear', say: '观察物体', label: '观察物体' });
    tl.push(1.0, function (e) { frontT = e; }, { ease: 'outBack', say: '从前面看', label: '从前面看' });
    tl.push(1.0, function (e) { sideT = e; }, { ease: 'outCubic', say: '从侧面看', label: '从侧面看' });
    tl.push(1.0, function (e) { topT = e; }, { ease: 'outCubic', say: '从上面看', label: '从上面看' });
    tl.push(1.2, function (e) { rotateT = e; }, { ease: 'outElastic', say: '位置不同，看到的形状也不同', label: '位置不同，看到的形状也不同' });

    function draw(ctx, W, H, t) {
      skyBg(ctx, W, H, t, { decoSet: 'town', grass: '#C9F0C0' });

      var cx = W * 0.36, base = H * 0.72;
      var u = Math.min(W * 0.07, H * 0.12);
      var rot = rotateT * Math.PI * 0.5;

      /* 立体小方块堆（等轴测） */
      function cube(gx, gy, gz, alpha, color) {
        var ox = cx + (gx - gz) * u * 0.86;
        var oy = base + (gx + gz) * u * 0.42 - gy * u;
        ctx.save();
        ctx.globalAlpha = alpha;
        /* 顶面 */
        ctx.beginPath();
        ctx.moveTo(ox, oy - u * 0.5);
        ctx.lineTo(ox + u * 0.86, oy - u * 0.06);
        ctx.lineTo(ox, oy + u * 0.38);
        ctx.lineTo(ox - u * 0.86, oy - u * 0.06);
        ctx.closePath();
        ctx.fillStyle = color.top; ctx.fill();
        /* 左面 */
        ctx.beginPath();
        ctx.moveTo(ox - u * 0.86, oy - u * 0.06);
        ctx.lineTo(ox, oy + u * 0.38);
        ctx.lineTo(ox, oy + u * 1.30);
        ctx.lineTo(ox - u * 0.86, oy + u * 0.86);
        ctx.closePath();
        ctx.fillStyle = color.left; ctx.fill();
        /* 右面 */
        ctx.beginPath();
        ctx.moveTo(ox + u * 0.86, oy - u * 0.06);
        ctx.lineTo(ox, oy + u * 0.38);
        ctx.lineTo(ox, oy + u * 1.30);
        ctx.lineTo(ox + u * 0.86, oy + u * 0.86);
        ctx.closePath();
        ctx.fillStyle = color.right; ctx.fill();
        ctx.restore();
      }

      var C1 = { top: '#FFE08A', left: '#FFC93C', right: '#E8A92E' };
      var C2 = { top: '#A8E0FF', left: '#7EC8F5', right: '#5FAFE0' };
      var C3 = { top: '#FFC6D9', left: '#FF9BB8', right: '#E8748F' };

      ctx.save();
      ctx.translate(cx, base);
      ctx.rotate(rot * 0.25);
      ctx.translate(-cx, -base);
      if (shapeMode === 0) {
        cube(0, 0, 0, 0.95, C1); cube(1, 0, 0, 0.95, C2); cube(1, 1, 0, 0.95, C3);
      } else if (shapeMode === 1) {
        cube(0, 0, 0, 0.95, C1); cube(0, 0, 1, 0.95, C2); cube(0, 1, 0, 0.95, C3);
      } else {
        cube(0, 0, 0, 0.95, C1); cube(1, 0, 0, 0.95, C2);
        cube(0, 0, 1, 0.95, C3); cube(0, 1, 0, 0.95, C2);
      }
      ctx.restore();

      /* 三个视角的方框 */
      var bw = Math.min(W * 0.13, 110);
      var bh = bw * 0.72;
      var by = H * 0.20;

      function viewBox(x, alpha, label, shape, color) {
        if (alpha <= 0.02) return;
        ctx.save();
        ctx.globalAlpha = alpha;
        E.roundRect(ctx, x - bw / 2, by, bw, bh, 12);
        ctx.fillStyle = '#FFFFFF'; ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.stroke();
        /* 形状 */
        ctx.fillStyle = color;
        var s = bw * 0.30;
        if (shape === 'front') {
          ctx.fillRect(x - s * 0.9, by + bh * 0.30, s * 1.8, s * 1.1);
        } else if (shape === 'side') {
          ctx.fillRect(x - s * 0.5, by + bh * 0.30, s, s * 1.1);
          ctx.fillRect(x - s * 0.5, by + bh * 0.30 - s * 0.95, s, s * 0.85);
        } else {
          ctx.fillRect(x - s * 0.9, by + bh * 0.36, s * 1.8, s * 0.9);
        }
        ctx.textAlign = 'center';
        ctx.font = '900 ' + Math.round(bw * 0.19) + 'px "PingFang SC",sans-serif';
        ctx.fillStyle = color;
        ctx.fillText(label, x, by + bh + bw * 0.24);
        ctx.restore();
      }

      viewBox(W * 0.24, frontT, '前面', 'front', '#4AA8E0');
      viewBox(W * 0.50, sideT, '侧面', 'side', '#5CC44A');
      viewBox(W * 0.76, topT, '上面', 'top', '#FF6E96');

      /* 眼睛图标 */
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '900 ' + Math.round(Math.min(W * 0.05, 28)) + 'px "PingFang SC",sans-serif';
      ctx.fillStyle = '#8A7059';
      ctx.fillText('同一个物体，换个角度看一看', W * 0.5, H * 0.10);
      ctx.restore();
    }

    function reroll() {
      if (window.__swapLesson) window.__swapLesson(observeLesson({ mode: Math.floor(Math.random() * 3) }));
    }

    return { tl: tl, draw: draw, steps: 5, name: '观察物体', py: 'guān chá wù tǐ', reroll: reroll };
  }

  /* =======================================================
     9. 数学广角·搭配：2件上衣 × 3条裤子
     ======================================================= */
  function matchLesson(opt) {
    opt = opt || {};
    var tl = new E.Timeline();
    var tops = 0, pants = 0, linkT = 0, countT = 0;
    var nTops = opt.tops || 2, nPants = opt.pants || 3;

    tl.push(0.1, function () {}, { ease: 'linear', say: '搭配问题', label: '搭配问题' });
    tl.push(1.0, function (e) { tops = e; }, { ease: 'outBack', say: '两件上衣', label: '两件上衣' });
    tl.push(1.0, function (e) { pants = e; }, { ease: 'outCubic', say: '三条裤子', label: '三条裤子' });
    tl.push(1.4, function (e) { linkT = e; }, { ease: 'outCubic', say: '一件上衣配三条裤子，有六种搭配', label: '一件上衣配三条裤子，有六种搭配' });
    tl.push(1.0, function (e) { countT = e; }, { ease: 'outElastic', say: '二乘三等于六', label: '二乘三等于六' });

    function draw(ctx, W, H, t) {
      skyBg(ctx, W, H, t, { decoSet: 'park', grass: '#C4EEB4' });

      var topX = W * 0.22;
      var pantX = W * 0.74;
      var sc = Math.min(W, H) / 620;
      var startY = H * 0.30;
      var gapY = Math.min(H * 0.17, 92);
      var topColors = ['#FF9BB8', '#7EC8F5'];
      var pantColors = ['#5CC44A', '#FFD93D', '#C79BF5'];

      function drawTop(x, y, color, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - 26 * sc, y - 22 * sc);
        ctx.lineTo(x - 10 * sc, y - 30 * sc);
        ctx.lineTo(x + 10 * sc, y - 30 * sc);
        ctx.lineTo(x + 26 * sc, y - 22 * sc);
        ctx.lineTo(x + 20 * sc, y - 10 * sc);
        ctx.lineTo(x + 16 * sc, y - 10 * sc);
        ctx.lineTo(x + 16 * sc, y + 24 * sc);
        ctx.lineTo(x - 16 * sc, y + 24 * sc);
        ctx.lineTo(x - 16 * sc, y - 10 * sc);
        ctx.lineTo(x - 20 * sc, y - 10 * sc);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.8)';
        ctx.lineWidth = 2.5 * sc; ctx.stroke();
        ctx.restore();
      }

      function drawPants(x, y, color, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - 20 * sc, y - 24 * sc);
        ctx.lineTo(x + 20 * sc, y - 24 * sc);
        ctx.lineTo(x + 18 * sc, y + 26 * sc);
        ctx.lineTo(x + 5 * sc, y + 26 * sc);
        ctx.lineTo(x, y - 2 * sc);
        ctx.lineTo(x - 5 * sc, y + 26 * sc);
        ctx.lineTo(x - 18 * sc, y + 26 * sc);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.8)';
        ctx.lineWidth = 2.5 * sc; ctx.stroke();
        ctx.restore();
      }

      var nTop = Math.round(clamp(tops, 0, 1) * nTops);
      var nPant = Math.round(clamp(pants, 0, 1) * nPants);

      for (var i = 0; i < nTops; i++) {
        drawTop(topX, startY + i * gapY, topColors[i % topColors.length], i < nTop ? 1 : 0.14);
      }
      for (var j = 0; j < nPants; j++) {
        drawPants(pantX, startY - gapY * 0.5 + j * gapY, pantColors[j % pantColors.length], j < nPant ? 1 : 0.14);
      }

      /* 连线 */
      var totalLinks = nTops * nPants;
      var shownLinks = Math.round(clamp(linkT, 0, 1) * totalLinks);
      var li = 0;
      for (var a = 0; a < nTops; a++) {
        for (var b = 0; b < nPants; b++) {
          if (li >= shownLinks) break;
          var y1 = startY + a * gapY;
          var y2 = startY - gapY * 0.5 + b * gapY;
          ctx.save();
          ctx.globalAlpha = 0.55;
          ctx.strokeStyle = topColors[a];
          ctx.lineWidth = 3.5;
          ctx.setLineDash([7, 6]);
          ctx.beginPath();
          ctx.moveTo(topX + 30 * sc, y1);
          ctx.bezierCurveTo(W * 0.46, y1, W * 0.52, y2, pantX - 26 * sc, y2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
          li++;
        }
      }

      /* 计数 */
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '900 ' + Math.round(Math.min(W * 0.058, 34)) + 'px "PingFang SC",sans-serif';
      ctx.fillStyle = '#4AA8E0';
      ctx.fillText(nTops + ' × ' + nPants + ' = ' + (nTops * nPants) + ' 种', W * 0.5, H * 0.13);
      if (countT > 0.25) {
        ctx.globalAlpha = clamp((countT - 0.25) * 1.6, 0, 1);
        ctx.font = '900 ' + Math.round(Math.min(W * 0.05, 28)) + 'px "PingFang SC",sans-serif';
        ctx.fillStyle = '#FF6E96';
        ctx.fillText('有序搭配，不重复不遗漏', W * 0.5, H * 0.90);
      }
      ctx.restore();

      E.kitty(ctx, W * 0.50, H * 0.80, sc * 0.85);
    }

    function reroll() {
      if (window.__swapLesson) window.__swapLesson(matchLesson({
        tops: 2 + Math.floor(Math.random() * 2),
        pants: 2 + Math.floor(Math.random() * 3)
      }));
    }

    return { tl: tl, draw: draw, steps: 5, name: '数学广角·搭配', py: 'shù xué guǎng jiǎo · dā pèi', reroll: reroll };
  }

  /* 包装：每帧自动附加步骤说明 */
  function wrap(lf) {
    return function (opt) {
      var L = lf(opt);
      var origDraw = L.draw;
      var tlRef = L.tl;
      /* 用普通对象承载，完整保留 reroll 等所有属性 */
      var wrapped = {};
      for (var k in L) { if (Object.prototype.hasOwnProperty.call(L, k)) wrapped[k] = L[k]; }
      wrapped.draw = function (ctx, W, H, t, dt) {
        origDraw(ctx, W, H, t, dt);
        var cur = (wrapped.tl === tlRef) ? tlRef : wrapped.tl;
        drawStepLabel(ctx, W, H, cur);
      };
      return wrapped;
    };
  }


  /* =======================================================
     下册 1. 除法的初步认识：12 个苹果平均分到 3 个盘子
     ======================================================= */
  function divideLesson(opt) {
    opt = opt || {};
    var TOTAL = opt.total || 12;
    var PLATES = opt.plates || 3;
    var EACH = Math.floor(TOTAL / PLATES);
    var tl = new E.Timeline();
    var plateT = 0, moveT = 0, resultT = 0;

    tl.push(0.1, function () {}, { ease: 'linear', say: TOTAL + '个苹果，平均分到' + PLATES + '个盘子', label: '准备平均分' });
    tl.push(1.1, function (e) { plateT = e; },
      { ease: 'outBack', say: '先放' + PLATES + '个盘子', label: '摆好' + PLATES + '个盘子' });
    tl.push(2.0, function (e) { moveT = e; },
      { ease: 'inOutQuad', say: '一个一个地分，每个盘子一样多', label: '一个一个地分' });
    tl.push(1.2, function (e) { resultT = e; },
      { ease: 'outElastic', say: TOTAL + '除以' + PLATES + '等于' + EACH, label: '每盘 ' + EACH + ' 个' });

    function draw(ctx, W, H, t) {
      skyBg(ctx, W, H, t, { decoSet: 'park', grass: '#C4EEB4' });
      var sc = Math.min(W, H) / 620;

      /* 篮子里的苹果（待分） */
      var basketX = W * 0.5, basketY = H * 0.24;
      var remain = TOTAL - Math.floor(moveT * TOTAL);
      if (moveT >= 1) remain = 0;
      ctx.save();
      ctx.globalAlpha = remain > 0 ? 1 : 0.25;
      ctx.fillStyle = '#D9A05B';
      E.roundRect(ctx, basketX - 62 * sc, basketY - 22 * sc, 124 * sc, 46 * sc, 12 * sc);
      ctx.fill();
      ctx.strokeStyle = '#B8863F'; ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
      for (var i = 0; i < remain; i++) {
        var bx = basketX - 40 * sc + (i % 6) * 16 * sc;
        var by = basketY - 30 * sc - Math.floor(i / 6) * 18 * sc;
        E.apple(ctx, bx, by, 11 * sc);
      }

      /* 盘子 */
      var n = Math.round(clamp(plateT, 0, 1) * PLATES);
      var baseY = H * 0.72;
      var gapX = Math.min(W * 0.26, 230);
      var startX = W * 0.5 - (PLATES - 1) * gapX * 0.5;

      for (var p2 = 0; p2 < n; p2++) {
        var px = startX + p2 * gapX;
        /* 盘子 */
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(px, baseY, 56 * sc, 17 * sc, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF'; ctx.fill();
        ctx.strokeStyle = '#8FD4F7'; ctx.lineWidth = 4; ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(px, baseY - 4 * sc, 42 * sc, 12 * sc, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#EAF6FF'; ctx.fill();
        ctx.restore();

        /* 已分到的苹果 */
        var got = 0;
        for (var k = 0; k < EACH; k++) {
          var arriveAt = (p2 * EACH + k + 1) / TOTAL;
          if (moveT >= arriveAt) got++;
        }
        for (var m = 0; m < got; m++) {
          var ax = px - 22 * sc + (m % 2) * 30 * sc;
          var ay = baseY - 18 * sc - Math.floor(m / 2) * 20 * sc;
          E.apple(ctx, ax, ay, 13 * sc);
        }
      }

      /* 算式 */
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '900 ' + Math.round(Math.min(W * 0.07, 42)) + 'px "PingFang SC",sans-serif';
      ctx.lineWidth = 7; ctx.strokeStyle = '#FFF';
      var txt = TOTAL + ' ÷ ' + PLATES + ' = ' + (resultT > 0.4 ? EACH : '?');
      ctx.strokeText(txt, W * 0.5, H * 0.13);
      ctx.fillStyle = '#F0578A';
      ctx.fillText(txt, W * 0.5, H * 0.13);
      ctx.restore();

      if (resultT > 0.3) {
        ctx.save();
        ctx.globalAlpha = clamp((resultT - 0.3) * 1.7, 0, 1);
        ctx.textAlign = 'center';
        ctx.font = '900 ' + Math.round(Math.min(W * 0.05, 30)) + 'px "PingFang SC",sans-serif';
        ctx.fillStyle = '#5CC44A';
        ctx.lineWidth = 5; ctx.strokeStyle = '#FFF';
        ctx.strokeText('平均分 · 每份同样多', W * 0.5, H * 0.90);
        ctx.fillText('平均分 · 每份同样多', W * 0.5, H * 0.90);
        ctx.restore();
      }
      E.kitty(ctx, W * 0.90, H * 0.80, sc * 0.95);
    }

    function reroll() {
      var pl = 2 + Math.floor(Math.random() * 4);
      var each = 2 + Math.floor(Math.random() * 6);
      if (window.__swapLesson) window.__swapLesson(divideLesson({ total: pl * each, plates: pl }));
    }

    return { tl: tl, draw: draw, steps: 4, name: '除法的初步认识',
             py: 'chú fǎ de chū bù rèn shi', reroll: reroll };
  }

  /* =======================================================
     下册 2. 有余数的除法：17 ÷ 5 = 3 ... 2
     ======================================================= */
  function remainderLesson(opt) {
    opt = opt || {};
    var TOTAL = opt.total || 17;
    var PER = opt.per || 5;
    var GROUPS = Math.floor(TOTAL / PER);
    var LEFT = TOTAL - GROUPS * PER;
    var tl = new E.Timeline();
    var groupT = 0, leftT = 0, resT = 0;

    tl.push(0.1, function () {}, { ease: 'linear', say: TOTAL + '个，每' + PER + '个装一袋', label: '每袋装 ' + PER + ' 个' });
    tl.push(1.8, function (e) { groupT = e; },
      { ease: 'inOutQuad', say: '装一袋，再装一袋', label: '一袋一袋地装' });
    tl.push(1.2, function (e) { leftT = e; },
      { ease: 'outBack', say: '剩下的不够装一袋', label: '剩下的不够一袋' });
    tl.push(1.1, function (e) { resT = e; },
      { ease: 'outElastic', say: TOTAL + '除以' + PER + '等于' + GROUPS + '余' + LEFT,
        label: '商 ' + GROUPS + ' 余 ' + LEFT });

    function draw(ctx, W, H, t) {
      skyBg(ctx, W, H, t, { decoSet: 'farm', grass: '#C4EEB4' });
      var sc = Math.min(W, H) / 620;
      var R = 13 * sc;

      /* 原始一列圆点 */
      var startX = W * 0.14, startY = H * 0.30;
      var perRow = 9;

      /* 已装入袋子的 */
      var placed = Math.floor(clamp(groupT, 0, 1) * GROUPS * PER);
      var bagW = Math.min(W * 0.13, 110), bagH = bagW * 1.15;
      var bagY = H * 0.58;
      var bagGap = Math.min(W * 0.17, 150);
      var bagStartX = W * 0.5 - (GROUPS - 1) * bagGap * 0.5;

      for (var g = 0; g < GROUPS; g++) {
        var bx = bagStartX + g * bagGap;
        var inBag = clamp(placed - g * PER, 0, PER);
        ctx.save();
        ctx.globalAlpha = 0.92;
        E.roundRect(ctx, bx - bagW / 2, bagY - bagH * 0.5, bagW, bagH, 14);
        ctx.fillStyle = 'rgba(255,240,200,.85)'; ctx.fill();
        ctx.strokeStyle = '#D9A05B'; ctx.lineWidth = 3.5; ctx.stroke();
        ctx.restore();
        for (var k = 0; k < inBag; k++) {
          E.dot(ctx, bx - bagW * 0.24 + (k % 2) * bagW * 0.46,
                bagY - bagH * 0.22 + Math.floor(k / 2) * bagW * 0.28, R * 0.85, '#FF9B7A');
        }
      }

      /* 剩下的零散点 */
      var showLeft = Math.round(clamp(leftT, 0, 1) * LEFT);
      var lx = W * 0.5 - (LEFT - 1) * (R * 2.6) * 0.5;
      var ly = H * 0.90;
      for (var q = 0; q < showLeft; q++) {
        E.dot(ctx, lx + q * R * 2.6, ly, R, '#FFD93D');
      }
      if (leftT > 0.2) {
        ctx.save();
        ctx.globalAlpha = clamp((leftT - 0.2) * 1.8, 0, 1);
        ctx.textAlign = 'center';
        ctx.font = '900 ' + Math.round(Math.min(W * 0.042, 24)) + 'px "PingFang SC",sans-serif';
        ctx.fillStyle = '#E8892E';
        ctx.fillText('剩余 ' + LEFT + ' 个', W * 0.5, H * 0.85);
        ctx.restore();
      }

      /* 算式 */
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '900 ' + Math.round(Math.min(W * 0.062, 38)) + 'px "PingFang SC",sans-serif';
      ctx.lineWidth = 7; ctx.strokeStyle = '#FFF';
      var txt = TOTAL + ' ÷ ' + PER + ' = ' + GROUPS + ' ... ' + (resT > 0.4 ? LEFT : '?');
      ctx.strokeText(txt, W * 0.5, H * 0.13);
      ctx.fillStyle = '#4A9BE0';
      ctx.fillText(txt, W * 0.5, H * 0.13);
      ctx.restore();
      E.kitty(ctx, W * 0.90, H * 0.30, sc * 0.85);
    }

    function reroll() {
      var per = 3 + Math.floor(Math.random() * 5);
      var g = 2 + Math.floor(Math.random() * 4);
      var left = 1 + Math.floor(Math.random() * (per - 1));
      if (window.__swapLesson) window.__swapLesson(remainderLesson({ total: per * g + left, per: per }));
    }

    return { tl: tl, draw: draw, steps: 4, name: '有余数的除法',
             py: 'yǒu yú shù de chú fǎ', reroll: reroll };
  }

  /* =======================================================
     下册 3. 万以内数的认识：数位与计数单位
     ======================================================= */
  function bigNumberLesson(opt) {
    opt = opt || {};
    var NUM = opt.num || 2356;
    var digits = String(NUM).split('');
    var tl = new E.Timeline();
    var colT = 0, fillT = 0, readT = 0;
    var names = ['千位', '百位', '十位', '个位'];
    var off = 4 - digits.length;

    tl.push(0.1, function () {}, { ease: 'linear', say: '认识万以内的数', label: '认识数位' });
    tl.push(1.2, function (e) { colT = e; },
      { ease: 'outBack', say: '从右边起，个位、十位、百位、千位', label: '个位·十位·百位·千位' });
    tl.push(2.0, function (e) { fillT = e; },
      { ease: 'outCubic', say: '每个数位上的数表示不同的意思', label: '数字落在对应数位' });
    tl.push(1.3, function (e) { readT = e; },
      { ease: 'outElastic', say: '读作' + NUM, label: '读作 ' + NUM });

    function draw(ctx, W, H, t) {
      skyBg(ctx, W, H, t, { decoSet: 'town', grass: '#C9F0C0' });
      var sc = Math.min(W, H) / 620;
      var colW = Math.min(W * 0.20, 150);
      var gap = colW + 10;
      var totalW = 4 * gap;
      var startX = W * 0.5 - totalW * 0.5 + gap * 0.5;
      var topY = H * 0.26;
      var cellH = Math.min(H * 0.30, 170);

      var showCols = Math.round(clamp(colT, 0, 1) * 4);
      for (var i = 0; i < 4; i++) {
        if (i >= showCols) continue;
        var cx = startX + i * gap;
        /* 数位名 */
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = '900 ' + Math.round(Math.min(W * 0.036, 22)) + 'px "PingFang SC",sans-serif';
        ctx.fillStyle = '#4A9BE0';
        ctx.fillText(names[i], cx, topY - 16);
        ctx.restore();
        /* 格子 */
        ctx.save();
        E.roundRect(ctx, cx - colW / 2, topY, colW, cellH, 14);
        ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.fill();
        ctx.strokeStyle = '#8FD4F7'; ctx.lineWidth = 4; ctx.stroke();
        ctx.restore();
        /* 数字 */
        var di = i - off;
        if (di >= 0 && di < digits.length) {
          var prog = clamp(fillT * 4 - i, 0, 1);
          if (prog > 0) {
            ctx.save();
            var pop = E.ease.outBack(prog);
            ctx.globalAlpha = Math.min(1, prog * 2);
            ctx.translate(cx, topY + cellH * 0.58);
            ctx.scale(0.4 + 0.6 * pop, 0.4 + 0.6 * pop);
            ctx.textAlign = 'center';
            ctx.font = '900 ' + Math.round(colW * 0.62) + 'px "PingFang SC",sans-serif';
            ctx.fillStyle = ['#F0578A', '#FF9B2E', '#5CC44A', '#4A9BE0'][i % 4];
            ctx.fillText(digits[di], 0, 0);
            ctx.restore();
          }
        }
      }

      /* 读法 */
      if (readT > 0.3) {
        ctx.save();
        ctx.globalAlpha = clamp((readT - 0.3) * 1.7, 0, 1);
        ctx.textAlign = 'center';
        ctx.font = '900 ' + Math.round(Math.min(W * 0.058, 34)) + 'px "PingFang SC",sans-serif';
        ctx.lineWidth = 6; ctx.strokeStyle = '#FFF';
        ctx.strokeText('读作：' + NUM, W * 0.5, H * 0.88);
        ctx.fillStyle = '#5CC44A';
        ctx.fillText('读作：' + NUM, W * 0.5, H * 0.88);
        ctx.restore();
      }
      E.bird(ctx, W * 0.10, H * 0.12, sc * 0.75, t);
    }

    function reroll() {
      var n = 100 + Math.floor(Math.random() * 8900);
      if (window.__swapLesson) window.__swapLesson(bigNumberLesson({ num: n }));
    }

    return { tl: tl, draw: draw, steps: 4, name: '万以内数的认识',
             py: 'wàn yǐ nèi shù de rèn shi', reroll: reroll };
  }


  /* =======================================================
     下册 4. 克与千克：天平比轻重
     ======================================================= */
  function weightLesson(opt) {
    opt = opt || {};
    var tl = new E.Timeline();
    var scaleT = 0, itemT = 0, tipT = 0, resT = 0;

    tl.push(0.1, function () {}, { ease: 'linear', say: '克与千克', label: '认识质量单位' });
    tl.push(1.1, function (e) { scaleT = e; },
      { ease: 'outBack', say: '这是一台天平', label: '这是一台天平' });
    tl.push(1.3, function (e) { itemT = e; },
      { ease: 'outCubic', say: '左边放苹果，右边放砝码', label: '左物右码' });
    tl.push(1.3, function (e) { tipT = e; },
      { ease: 'outCubic', say: '天平平衡了，苹果重200克', label: '平衡了 → 200克' });
    tl.push(1.2, function (e) { resT = e; },
      { ease: 'outElastic', say: '一千克等于一千克', label: '1 千克 = 1000 克' });

    function draw(ctx, W, H, t) {
      skyBg(ctx, W, H, t, { decoSet: 'farm', grass: '#C4EEB4' });
      var sc = Math.min(W, H) / 620;
      var cx = W * 0.5, baseY = H * 0.76;
      var armY = H * 0.30;
      var armLen = Math.min(W * 0.30, 240);

      /* 支点立柱 */
      ctx.save();
      ctx.globalAlpha = clamp(scaleT * 2, 0, 1);
      ctx.fillStyle = '#B8863F';
      E.roundRect(ctx, cx - 9 * sc, armY, 18 * sc, baseY - armY, 8 * sc);
      ctx.fill();
      E.roundRect(ctx, cx - 70 * sc, baseY - 12 * sc, 140 * sc, 16 * sc, 8 * sc);
      ctx.fillStyle = '#D9A05B'; ctx.fill();
      ctx.restore();

      /* 横梁：平衡时水平，未放时略斜 */
      var tilt = (itemT > 0.9 && tipT > 0.5) ? 0 : (tipT > 0 ? 0.06 : 0.13);
      ctx.save();
      ctx.globalAlpha = clamp(scaleT * 2, 0, 1);
      ctx.translate(cx, armY);
      ctx.rotate(tilt);
      ctx.strokeStyle = '#E8892E';
      ctx.lineWidth = 11 * sc;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-armLen, 0); ctx.lineTo(armLen, 0);
      ctx.stroke();
      /* 两个托盘 */
      for (var sgn = -1; sgn <= 1; sgn += 2) {
        var px = sgn * armLen;
        ctx.beginPath();
        ctx.moveTo(px, 0); ctx.lineTo(px, 26 * sc);
        ctx.strokeStyle = '#B8863F'; ctx.lineWidth = 3.5; ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(px, 32 * sc, 46 * sc, 13 * sc, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF0C8'; ctx.fill();
        ctx.strokeStyle = '#D9A05B'; ctx.lineWidth = 3.5; ctx.stroke();
      }
      ctx.restore();

      /* 左盘：苹果 */
      if (itemT > 0.15) {
        ctx.save();
        ctx.globalAlpha = clamp((itemT - 0.15) * 2, 0, 1);
        var ly = armY + 18 * sc;
        E.apple(ctx, cx - armLen, ly - 6 * sc, 20 * sc);
        ctx.restore();
      }
      /* 右盘：砝码 */
      if (itemT > 0.5) {
        ctx.save();
        ctx.globalAlpha = clamp((itemT - 0.5) * 2, 0, 1);
        var ry = armY + 20 * sc;
        ctx.fillStyle = '#9BA8B8';
        E.roundRect(ctx, cx + armLen - 20 * sc, ry - 26 * sc, 40 * sc, 26 * sc, 5);
        ctx.fill();
        ctx.fillStyle = '#6E7C8C';
        ctx.font = '900 ' + Math.round(15 * sc) + 'px "PingFang SC",sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('200g', cx + armLen, ry - 8 * sc);
        ctx.restore();
      }

      /* 平衡提示 */
      if (tipT > 0.4) {
        ctx.save();
        ctx.globalAlpha = clamp((tipT - 0.4) * 2, 0, 1);
        ctx.textAlign = 'center';
        ctx.font = '900 ' + Math.round(Math.min(W * 0.05, 30)) + 'px "PingFang SC",sans-serif';
        ctx.fillStyle = '#5CC44A';
        ctx.lineWidth = 5; ctx.strokeStyle = '#FFF';
        ctx.strokeText('平衡 → 苹果重 200 克', W * 0.5, H * 0.90);
        ctx.fillText('平衡 → 苹果重 200 克', W * 0.5, H * 0.90);
        ctx.restore();
      }

      /* 换算 */
      if (resT > 0.25) {
        ctx.save();
        ctx.globalAlpha = clamp((resT - 0.25) * 1.8, 0, 1);
        var pop = E.ease.outElastic(clamp((resT - 0.25) * 1.5, 0, 1));
        ctx.translate(W * 0.5, H * 0.13);
        ctx.scale(0.5 + 0.5 * pop, 0.5 + 0.5 * pop);
        ctx.textAlign = 'center';
        ctx.font = '900 ' + Math.round(Math.min(W * 0.062, 38)) + 'px "PingFang SC",sans-serif';
        ctx.lineWidth = 7; ctx.strokeStyle = '#FFF';
        ctx.strokeText('1 千克 = 1000 克', 0, 0);
        ctx.fillStyle = '#F0578A';
        ctx.fillText('1 千克 = 1000 克', 0, 0);
        ctx.restore();
      }
      E.kitty(ctx, W * 0.90, H * 0.84, sc * 0.9);
    }

    function reroll() {
      if (window.__swapLesson) window.__swapLesson(weightLesson());
    }

    return { tl: tl, draw: draw, steps: 5, name: '克与千克',
             py: 'kè yǔ qiān kè', reroll: reroll };
  }

  /* =======================================================
     下册 5. 图形的运动：平移 / 旋转 / 轴对称
     ======================================================= */
  function motionLesson(opt) {
    opt = opt || {};
    var MODE = opt.mode === undefined ? 0 : opt.mode;
    var SHAPE = opt.shape === undefined ? 0 : opt.shape;
    var tl = new E.Timeline();
    var baseT = 0, moveT = 0, axisT = 0, doneT = 0;

    var names = ['平移', '旋转', '轴对称'];
    tl.push(0.1, function () {}, { ease: 'linear', say: '图形的运动', label: '图形的运动' });
    tl.push(1.0, function (e) { baseT = e; },
      { ease: 'outBack', say: '先看这个图形', label: '看这个图形' });
    tl.push(1.8, function (e) { moveT = e; },
      { ease: 'inOutQuad', say: names[MODE], label: names[MODE] });
    if (MODE === 2) {
      tl.push(1.3, function (e) { axisT = e; },
        { ease: 'outCubic', say: '沿着对称轴对折，两边完全重合', label: '两边完全重合' });
    }
    tl.push(1.1, function (e) { doneT = e; },
      { ease: 'outElastic', say: names[MODE] + '完成', label: names[MODE] + '完成' });

    function drawShape(ctx, x, y, s, color, rot) {
      ctx.save();
      ctx.translate(x, y);
      if (rot) ctx.rotate(rot);
      ctx.fillStyle = color;
      ctx.beginPath();
      if (SHAPE === 0) {
        /* 房子形 */
        ctx.moveTo(-s, s * 0.9);
        ctx.lineTo(-s, -s * 0.2);
        ctx.lineTo(0, -s);
        ctx.lineTo(s, -s * 0.2);
        ctx.lineTo(s, s * 0.9);
        ctx.closePath();
      } else if (SHAPE === 1) {
        /* 箭头形：平移方向感强 */
        ctx.moveTo(-s, -s * 0.42);
        ctx.lineTo(s * 0.15, -s * 0.42);
        ctx.lineTo(s * 0.15, -s * 0.85);
        ctx.lineTo(s, 0);
        ctx.lineTo(s * 0.15, s * 0.85);
        ctx.lineTo(s * 0.15, s * 0.42);
        ctx.lineTo(-s, s * 0.42);
        ctx.closePath();
      } else if (SHAPE === 2) {
        /* 风车形：旋转感强 */
        for (var b = 0; b < 4; b++) {
          var a0 = b * Math.PI / 2;
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, s, a0, a0 + Math.PI / 3);
          ctx.closePath();
        }
      } else {
        /* 心形/蝶形：对称感强 */
        ctx.moveTo(0, s * 0.9);
        ctx.bezierCurveTo(-s * 1.4, -s * 0.1, -s * 0.5, -s * 1.1, 0, -s * 0.35);
        ctx.bezierCurveTo(s * 0.5, -s * 1.1, s * 1.4, -s * 0.1, 0, s * 0.9);
        ctx.closePath();
      }
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.85)';
      ctx.lineWidth = s * 0.11;
      ctx.stroke();
      ctx.restore();
    }

    function draw(ctx, W, H, t) {
      skyBg(ctx, W, H, t, { decoSet: 'sky', grass: '#C9F0C0' });
      var sc = Math.min(W, H) / 620;
      var baseX = W * 0.28, baseY = H * 0.52;
      var sz = Math.min(W * 0.075, 62);

      /* 原图（半透明） */
      ctx.save();
      ctx.globalAlpha = clamp(baseT, 0, 1) * 0.30;
      drawShape(ctx, baseX, baseY, sz, '#9BA8B8', 0);
      ctx.restore();

      if (MODE === 0) {
        /* 平移：沿直线移动 */
        var tx = baseX + moveT * W * 0.42;
        drawShape(ctx, tx, baseY, sz, '#4A9BE0', 0);
        /* 轨迹 */
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#8FD4F7';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([9, 8]);
        ctx.beginPath();
        ctx.moveTo(baseX + sz, baseY);
        ctx.lineTo(baseX + moveT * W * 0.42 + sz, baseY);
        ctx.stroke();
        ctx.setLineDash([]);
        /* 箭头 */
        ctx.beginPath();
        var ax = baseX + moveT * W * 0.42 + sz + 16;
        ctx.moveTo(ax - 14, baseY - 9); ctx.lineTo(ax, baseY); ctx.lineTo(ax - 14, baseY + 9);
        ctx.strokeStyle = '#4A9BE0'; ctx.lineWidth = 4; ctx.stroke();
        ctx.restore();

      } else if (MODE === 1) {
        /* 旋转：绕中心点转 */
        var ang = moveT * Math.PI * 1.5;
        var rx = baseX + W * 0.30, ry = baseY;
        ctx.save();
        ctx.beginPath();
        ctx.arc(rx, ry, sz * 1.7, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,155,122,.45)';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([10, 9]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        drawShape(ctx, rx, ry, sz, '#FF9B7A', ang);
        /* 中心点 */
        ctx.beginPath();
        ctx.arc(rx, ry, 7 * sc, 0, Math.PI * 2);
        ctx.fillStyle = '#E8892E'; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();

      } else {
        /* 轴对称：沿竖轴翻折 */
        var midX = W * 0.5;
        /* 对称轴 */
        ctx.save();
        ctx.globalAlpha = clamp(axisT * 2, 0, 1) * 0.85;
        ctx.strokeStyle = '#F0578A';
        ctx.lineWidth = 4.5;
        ctx.setLineDash([13, 10]);
        ctx.beginPath();
        ctx.moveTo(midX, H * 0.16);
        ctx.lineTo(midX, H * 0.86);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        var lx = midX - W * 0.16;
        drawShape(ctx, lx, baseY, sz, '#5CC44A', 0);

        /* 镜像：水平翻转 */
        if (moveT > 0.05) {
          var prog = clamp(moveT * 1.3, 0, 1);
          ctx.save();
          ctx.globalAlpha = prog;
          ctx.translate(midX, 0);
          ctx.scale(-1, 1);
          ctx.translate(-midX, 0);
          var mx = midX + W * 0.16;
          drawShape(ctx, mx, baseY, sz, '#C79BF5', 0);
          ctx.restore();
        }
        /* 折痕提示 */
        if (axisT > 0.5) {
          ctx.save();
          ctx.globalAlpha = clamp((axisT - 0.5) * 2, 0, 1);
          ctx.textAlign = 'center';
          ctx.font = '900 ' + Math.round(Math.min(W * 0.042, 24)) + 'px "PingFang SC",sans-serif';
          ctx.fillStyle = '#F0578A';
          ctx.fillText('对折后完全重合', midX, H * 0.92);
          ctx.restore();
        }
      }

      /* 顶部标签 */
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '900 ' + Math.round(Math.min(W * 0.07, 42)) + 'px "PingFang SC",sans-serif';
      ctx.lineWidth = 7; ctx.strokeStyle = '#FFF';
      ctx.strokeText(names[MODE], W * 0.5, H * 0.13);
      ctx.fillStyle = ['#4A9BE0', '#FF9B7A', '#F0578A'][MODE];
      ctx.fillText(names[MODE], W * 0.5, H * 0.13);
      ctx.restore();
    }

    function reroll() {
      if (window.__swapLesson) window.__swapLesson(motionLesson({ mode: MODE, shape: (SHAPE + 1) % 4 }));
    }

    var NAMES = ['平移', '旋转', '轴对称图形'];
    var PYS = ['píng yí', 'xuán zhuǎn', 'zhóu duì chèn tú xíng'];
    return { tl: tl, draw: draw, steps: MODE === 2 ? 5 : 4,
             name: NAMES[MODE], py: PYS[MODE], reroll: reroll };
  }

  /* =======================================================
     下册 3-1. 轴对称图形（独立课时）
     ======================================================= */
  function symmetryLesson(opt) {
    opt = opt || {};
    return motionLesson({ mode: 2, shape: opt.shape === undefined ? 3 : opt.shape });
  }

  /* =======================================================
     下册 3-2. 平移（独立课时）
     ======================================================= */
  function translateLesson(opt) {
    opt = opt || {};
    return motionLesson({ mode: 0, shape: opt.shape === undefined ? 1 : opt.shape });
  }

  /* =======================================================
     下册 3-3. 旋转（独立课时）
     ======================================================= */
  function rotateLesson(opt) {
    opt = opt || {};
    return motionLesson({ mode: 1, shape: opt.shape === undefined ? 2 : opt.shape });
  }

  /* =======================================================
     下册 6. 数据收集整理：条形统计图
     ======================================================= */
  function chartLesson(opt) {
    opt = opt || {};
    var DATA = opt.data || [6, 4, 8, 3];
    var LABELS = opt.labels || ['苹果', '香蕉', '橘子', '葡萄'];
    var COLORS = ['#FF6E96', '#FFD93D', '#FFA74D', '#C79BF5'];
    var MAXV = Math.max.apply(null, DATA);
    var SUM = DATA.reduce(function (a, b) { return a + b; }, 0);
    var tl = new E.Timeline();
    var axisT = 0, barT = 0, sumT = 0;

    tl.push(0.1, function () {}, { ease: 'linear', say: '收集数据，画统计图', label: '收集数据' });
    tl.push(1.1, function (e) { axisT = e; },
      { ease: 'outBack', say: '先画横轴和纵轴', label: '画坐标轴' });
    tl.push(2.0, function (e) { barT = e; },
      { ease: 'outCubic', say: '每个格子表示一个', label: '一格代表 1 个' });
    tl.push(1.2, function (e) { sumT = e; },
      { ease: 'outElastic', say: '一共' + SUM + '个', label: '一共 ' + SUM + ' 个' });

    function draw(ctx, W, H, t) {
      skyBg(ctx, W, H, t, { decoSet: 'play', grass: '#C9F0C0' });
      var sc = Math.min(W, H) / 620;
      var x0 = W * 0.16, x1 = W * 0.92;
      var y0 = H * 0.80, y1 = H * 0.22;
      var cols = DATA.length;
      var slot = (x1 - x0) / cols;
      var barW = slot * 0.46;

      /* 坐标轴 */
      ctx.save();
      ctx.globalAlpha = clamp(axisT * 2, 0, 1);
      ctx.strokeStyle = '#8B7355';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x0, y0); ctx.lineTo(x1, y0);
      ctx.moveTo(x0, y0); ctx.lineTo(x0, y1);
      ctx.stroke();
      /* 箭头 */
      ctx.beginPath();
      ctx.moveTo(x1 - 14, y0 - 9); ctx.lineTo(x1 + 2, y0); ctx.lineTo(x1 - 14, y0 + 9);
      ctx.moveTo(x0 - 9, y1 + 14); ctx.lineTo(x0, y1 - 2); ctx.lineTo(x0 + 9, y1 + 14);
      ctx.stroke();
      ctx.restore();

      /* 网格线与刻度 */
      var rows = MAXV;
      var unitH = (y0 - y1) / rows;
      ctx.save();
      ctx.globalAlpha = clamp(axisT * 2, 0, 1) * 0.5;
      ctx.strokeStyle = '#D8C8B0';
      ctx.lineWidth = 1.6;
      for (var r = 1; r <= rows; r++) {
        var gy = y0 - r * unitH;
        ctx.beginPath();
        ctx.moveTo(x0, gy); ctx.lineTo(x1, gy);
        ctx.stroke();
      }
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = clamp(axisT * 2, 0, 1);
      ctx.textAlign = 'right';
      ctx.font = '800 ' + Math.round(Math.min(W * 0.028, 17)) + 'px "PingFang SC",sans-serif';
      ctx.fillStyle = '#8B7355';
      for (var r2 = 1; r2 <= rows; r2++) {
        ctx.fillText(String(r2), x0 - 10, y0 - r2 * unitH + 6);
      }
      ctx.restore();

      /* 柱子 */
      for (var i = 0; i < cols; i++) {
        var prog = clamp(barT * cols - i, 0, 1);
        if (prog <= 0) continue;
        var ease = E.ease.outBack(prog);
        var bh = DATA[i] * unitH * ease;
        var bx = x0 + slot * i + slot * 0.5;
        var grad = ctx.createLinearGradient(0, y0 - bh, 0, y0);
        grad.addColorStop(0, COLORS[i]);
        grad.addColorStop(1, COLORS[i] + 'AA');
        ctx.save();
        E.roundRect(ctx, bx - barW / 2, y0 - bh, barW, bh, 8);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
        /* 数值 */
        if (prog > 0.85) {
          ctx.save();
          ctx.globalAlpha = clamp((prog - 0.85) * 6, 0, 1);
          ctx.textAlign = 'center';
          ctx.font = '900 ' + Math.round(Math.min(W * 0.034, 20)) + 'px "PingFang SC",sans-serif';
          ctx.fillStyle = '#3D2E22';
          ctx.fillText(String(DATA[i]), bx, y0 - bh - 10);
          ctx.restore();
        }
        /* 标签 */
        ctx.save();
        ctx.globalAlpha = clamp(prog * 1.5, 0, 1);
        ctx.textAlign = 'center';
        ctx.font = '900 ' + Math.round(Math.min(W * 0.03, 18)) + 'px "PingFang SC",sans-serif';
        ctx.fillStyle = '#8B7355';
        ctx.fillText(LABELS[i], bx, y0 + 30);
        ctx.restore();
      }

      /* 合计 */
      if (sumT > 0.3) {
        ctx.save();
        ctx.globalAlpha = clamp((sumT - 0.3) * 1.7, 0, 1);
        ctx.textAlign = 'center';
        ctx.font = '900 ' + Math.round(Math.min(W * 0.052, 32)) + 'px "PingFang SC",sans-serif';
        ctx.lineWidth = 6; ctx.strokeStyle = '#FFF';
        var txt = '一共 ' + SUM + ' 个';
        ctx.strokeText(txt, W * 0.5, H * 0.11);
        ctx.fillStyle = '#5CC44A';
        ctx.fillText(txt, W * 0.5, H * 0.11);
        ctx.restore();
      }
    }

    function reroll() {
      var d2 = [];
      for (var i = 0; i < 4; i++) d2.push(2 + Math.floor(Math.random() * 8));
      if (window.__swapLesson) window.__swapLesson(chartLesson({ data: d2 }));
    }

    return { tl: tl, draw: draw, steps: 4, name: '数据收集整理',
             py: 'shù jù shōu jí zhěng lǐ', reroll: reroll };
  }

  window.Lessons = {
    carry: wrap(carryLesson),
    borrow: wrap(borrowLesson),
    multiply: wrap(multiplyLesson),
    length: wrap(lengthLesson),
    angle: wrap(angleLesson),
    addNoCarry: wrap(addNoCarry),
    clock: wrap(clockLesson),
    observe: wrap(observeLesson),
    match: wrap(matchLesson),
    divide: wrap(divideLesson),
    remainder: wrap(remainderLesson),
    bigNumber: wrap(bigNumberLesson),
    weight: wrap(weightLesson),
    symmetry: wrap(symmetryLesson),
    translate: wrap(translateLesson),
    rotate: wrap(rotateLesson),
    chart: wrap(chartLesson)
  };
})();
