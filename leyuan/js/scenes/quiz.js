/* 通用答题关卡：供 learn/tech/biz/life/rules 五个场景复用 */
(function (g) {
  'use strict';
  g.OMNI_QUIZ = function (wrap, api, domainKey) {
    var D = (g.OMNI_CURRICULUM || {})[domainKey];
    if (!D) { wrap.innerHTML = '<div class="card"><h3 class="title">内容未就绪</h3><p class="sub">' + domainKey + '</p></div>'; return; }

    var idx = 0, score = 0, streak = 0;
    var total = D.items.length;

    function header() {
      return '<div class="card">' +
        '<h3 class="title">' + D.icon + ' ' + D.name + '</h3>' +
        '<p class="sub">' + D.tagline + '</p>' +
        '<div class="kv"><span>进度</span><b id="qProg">1 / ' + total + '</b></div>' +
        '<div class="bar"><i id="qBar" style="width:0%;background:linear-gradient(90deg,#5ee7ff,#b388ff)"></i></div>' +
        '<div class="kv"><span>连击</span><b id="qStreak">0 x</b></div>' +
        '</div>' +
        '<div class="card" id="qCard"></div>';
    }
    wrap.innerHTML = header();
    var card = wrap.querySelector('#qCard');

    function render() {
      var it = D.items[idx];
      wrap.querySelector('#qProg').textContent = (idx + 1) + ' / ' + total;
      wrap.querySelector('#qBar').style.width = Math.round(idx / total * 100) + '%';
      wrap.querySelector('#qStreak').textContent = streak + ' x';
      card.innerHTML =
        '<div><span class="tag">' + it.level + '</span><span class="pill">' + D.name + '</span></div>' +
        '<h5 style="font-size:17px;margin:10px 0 6px">' + it.title + '</h5>' +
        '<ul style="margin:6px 0 12px 18px;padding:0;color:#a9b6d8;font-size:13px;line-height:1.75">' +
          it.points.map(function (p) { return '<li>' + p + '</li>'; }).join('') +
        '</ul>' +
        '<div style="background:rgba(94,231,255,.09);border:1px solid rgba(94,231,255,.3);padding:11px 13px;border-radius:12px;font-size:13.5px;line-height:1.65;margin-bottom:12px">' + it.scenario + '</div>' +
        '<div id="optWrap"></div>' +
        '<div class="fb" id="fb"></div>';
      var optWrap = card.querySelector('#optWrap');
      var fb = card.querySelector('#fb');
      var answered = false;
      it.options.forEach(function (o, i) {
        var b = document.createElement('button');
        b.className = 'opt';
        b.textContent = String.fromCharCode(65 + i) + '. ' + o;
        b.onclick = function () {
          if (answered) return;
          answered = true;
          var btns = optWrap.querySelectorAll('.opt');
          btns.forEach(function (x, j) {
            x.disabled = true;
            if (j === it.answer) x.classList.add('right');
            else if (j === i && i !== it.answer) x.classList.add('wrong');
          });
          if (i === it.answer) {
            streak++; score++;
            var gain = 15 + streak * 5;
            api.addXP(gain, '答对');
            fb.className = 'fb ok';
            fb.textContent = '✅ 答对了！连击 ' + streak + '，+' + gain + ' XP\n' + it.why;
          } else {
            streak = 0;
            fb.className = 'fb no';
            fb.textContent = '❌ 再想想。正确答案：' + String.fromCharCode(65 + it.answer) + '. ' + it.options[it.answer] + '\n' + it.why;
          }
          var nb = document.createElement('button');
          nb.className = 'btn';
          nb.style.marginTop = '12px';
          nb.textContent = (idx + 1 >= total) ? '🏁 完成本场景' : '➡️ 下一题';
          nb.onclick = function () {
            idx++;
            if (idx >= total) finish();
            else render();
          };
          fb.appendChild(document.createElement('div'));
          fb.appendChild(nb);
        };
        optWrap.appendChild(b);
      });
    }

    function finish() {
      wrap.querySelector('#qBar').style.width = '100%';
      wrap.querySelector('#qProg').textContent = total + ' / ' + total;
      var rate = Math.round(score / total * 100);
      card.innerHTML =
        '<h5 style="font-size:19px;margin:4px 0 8px">🏆 ' + D.name + ' · 通关</h5>' +
        '<p class="sub">答对 ' + score + ' / ' + total + '，正确率 ' + rate + '%。</p>' +
        '<div class="bar"><i style="width:' + rate + '%;background:linear-gradient(90deg,#4ade80,#5ee7ff)"></i></div>' +
        '<div id="finBtns" style="margin-top:12px"></div>';
      var box = card.querySelector('#finBtns');
      var b1 = document.createElement('button');
      b1.className = 'btn'; b1.textContent = '🔁 再来一次';
      b1.onclick = function () { idx = 0; score = 0; streak = 0; render(); };
      var b2 = document.createElement('button');
      b2.className = 'btn ghost'; b2.style.marginLeft = '8px'; b2.textContent = '🏠 回首页';
      b2.onclick = function () { api.go('home'); };
      box.appendChild(b1); box.appendChild(b2);
      api.markDone(domainKey);
      api.addXP(30, '通关奖励');
    }
    render();
  };
})(window);
