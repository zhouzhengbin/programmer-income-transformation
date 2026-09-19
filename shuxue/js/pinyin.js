/* 拼音标注：给 [data-py] 元素上方渲染拼音 */
(function () {
  function render(scope) {
    var nodes = (scope || document).querySelectorAll('[data-py]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var py = el.getAttribute('data-py');
      if (!py) continue;
      if (el.querySelector('.py-tag')) continue;
      el.classList.add('has-py');
      var tag = document.createElement('span');
      tag.className = 'py-tag';
      tag.textContent = py;
      el.insertBefore(tag, el.firstChild);
    }
  }
  window.Pinyin = { render: render };
  document.addEventListener('DOMContentLoaded', function () { render(document); });
})();
