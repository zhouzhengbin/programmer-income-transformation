/* 场景：生活技能屋 */
(function (g) {
  'use strict';
  g.OMNI_SCENES = g.OMNI_SCENES || {};
  g.OMNI_SCENES.life = function (wrap, api) {
    wrap.innerHTML = '<div class="card"><h3 class="title">正在准备内容…</h3></div>';
    ensure(function () { g.OMNI_QUIZ(wrap, api, 'life'); });
  };
  function ensure(cb) {
    if (g.OMNI_CURRICULUM && g.OMNI_CURRICULUM.life && g.OMNI_QUIZ) return cb();
    var pending = 2;
    function done() { if (--pending <= 0) cb(); }
    load('js/data/curriculum_life.js', done);
    load('js/scenes/quiz.js', done);
  }
  function load(src, cb) {
    var s = document.createElement('script');
    s.src = src; s.onload = cb; s.onerror = cb;
    document.head.appendChild(s);
  }
})(window);
