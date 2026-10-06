/* 场景：商业模拟城（答题 + 经营模拟小游戏） */
(function (g) {
  'use strict';
  g.OMNI_SCENES = g.OMNI_SCENES || {};
  g.OMNI_SCENES.biz = function (wrap, api) {
    wrap.innerHTML = '<div class="card"><h3 class="title">正在准备内容…</h3></div>';
    ensure(function () { render(wrap, api); });
  };
  function ensure(cb) {
    if (g.OMNI_CURRICULUM && g.OMNI_CURRICULUM.biz && g.OMNI_QUIZ) return cb();
    var pending = 2;
    function done() { if (--pending <= 0) cb(); }
    load('js/data/curriculum_biz.js', done);
    load('js/scenes/quiz.js', done);
  }
  function load(src, cb) {
    var s = document.createElement('script');
    s.src = src; s.onload = cb; s.onerror = cb;
    document.head.appendChild(s);
  }

  function render(wrap, api) {
    wrap.innerHTML =
      '<div class="card">' +
        '<h3 class="title">💹 商业模拟城</h3>' +
        '<p class="sub">先玩一轮经营模拟：用 1000 元启动资金，决策每一步，看最后剩多少。</p>' +
        '<div class="grid">' +
          '<div class="card" style="margin:0"><h5 style="margin:0 0 6px;font-size:14px">模式 A · 小店经营</h5><p style="font-size:12.5px;color:#a9b6d8;line-height:1.6">流量 x 转化率 x 客单价</p><button class="btn" id="modeA" style="margin-top:10px">开始</button></div>' +
          '<div class="card" style="margin:0"><h5 style="margin:0 0 6px;font-size:14px">模式 B · 知识测验</h5><p style="font-size:12.5px;color:#a9b6d8;line-height:1.6">6 道成人也未必懂的商业模式题</p><button class="btn ghost" id="modeB" style="margin-top:10px">开始</button></div>' +
        '</div>' +
      '</div>' +
      '<div id="bizHolder"></div>';

    var holder = wrap.querySelector('#bizHolder');
    wrap.querySelector('#modeA').onclick = function () { sim(holder, api); };
    wrap.querySelector('#modeB').onclick = function () {
      holder.innerHTML = '<div class="card"><h3 class="title">💹 商业模式测验</h3></div>';
      g.OMNI_QUIZ(holder.firstChild, api, 'biz');
    };
  }

  function sim(holder, api) {
    var cash = 1000, day = 1, price = 20, ads = 0, quality = 0;
    var log = [];

    function view() {
      var traffic = 40 + ads * 25 + quality * 5;
      var conv = Math.min(0.35, 0.05 + quality * 0.03);
      var sold = Math.round(traffic * conv);
      var revenue = sold * price;
      var cost = ads * 40 + quality * 60;
      holder.innerHTML =
        '<div class="card">' +
          '<h3 class="title" style="font-size:20px">🏪 小店经营 · 第 ' + day + ' 天</h3>' +
          '<div class="kv"><span>现金</span><b>' + cash + ' 元</b></div>' +
          '<div class="kv"><span>今日流量</span><b>' + traffic + ' 人</b></div>' +
          '<div class="kv"><span>今日转化率</span><b>' + (conv * 100).toFixed(1) + '%</b></div>' +
          '<div class="kv"><span>预计成交</span><b>' + sold + ' 单 x ' + price + ' 元</b></div>' +
          '<div class="bar"><i style="width:' + Math.min(100, cash / 20) + '%;background:linear-gradient(90deg,#4ade80,#5ee7ff)"></i></div>' +
          '<div style="margin-top:10px">' +
            '<button class="btn" id="doAd">投广告（花 40 元 + 流量）</button>' +
            '<button class="btn ghost" id="doQ" style="margin-left:8px">提升品质（花 60 元 + 转化率）</button>' +
            '<button class="btn ghost" id="doNext" style="margin-left:8px">进入下一天</button>' +
          '</div>' +
          '<div class="fb" style="margin-top:10px">' + log.slice(-3).join('<br>') + '</div>' +
        '</div>';

      holder.querySelector('#doAd').onclick = function () {
        if (cash < 40) { api.toast('钱不够了'); return; }
        cash -= 40; ads++;
        log.push('第 ' + day + ' 天：投了广告，流量上升');
        view();
      };
      holder.querySelector('#doQ').onclick = function () {
        if (cash < 60) { api.toast('钱不够了'); return; }
        cash -= 60; quality++;
        log.push('第 ' + day + ' 天：提升品质，转化率上升');
        view();
      };
      holder.querySelector('#doNext').onclick = function () {
        var traffic = 40 + ads * 25 + quality * 5;
        var conv = Math.min(0.35, 0.05 + quality * 0.03);
        var revenue = Math.round(traffic * conv) * price;
        cash += revenue;
        log.push('第 ' + day + ' 天结算：收入 ' + revenue + ' 元');
        day++;
        api.addXP(5, '经营一天');
        if (day > 7) return end();
        view();
      };
    }

    function end() {
      var rate = Math.round((cash - 1000) / 1000 * 100);
      holder.innerHTML =
        '<div class="card">' +
          '<h3 class="title" style="font-size:20px">📊 7 天结算</h3>' +
          '<div class="kv"><span>最终现金</span><b>' + cash + ' 元</b></div>' +
          '<div class="kv"><span>相对本金</span><b>' + (rate >= 0 ? '+' : '') + rate + '%</b></div>' +
          '<p class="sub">商业的核心：现金 / 流量 / 转化 / 复购，任何一个都能让你翻盘，也都可能让你完蛋。</p>' +
          '<button class="btn" id="simAgain">再来一轮</button>' +
          '<button class="btn ghost" id="simHome" style="margin-left:8px">回首页</button>' +
        '</div>';
      holder.querySelector('#simAgain').onclick = function () { sim(holder, api); };
      holder.querySelector('#simHome').onclick = function () { api.go('home'); };
      api.addXP(40, '经营挑战完成');
    }
    view();
  }
})(window);
