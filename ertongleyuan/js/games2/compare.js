/* 数学4：比大小 */
const G_Compare = (()=>{
  function render(host, api){
    let idx = 0, right = 0;
    const list = Kit.shuffle(DATA.math.compare).slice(0,6);
    host.innerHTML = `
      <div class="hint-bar">哪个更大？点它 👆</div>
      <div class="cmp-stage">
        <div class="cmp-pair" id="cmpPair"></div>
        <div class="progress-wrap" style="margin-top:20px"><div class="progress-bar" id="cmpBar"></div></div>
      </div>`;
    const pair = Kit.$('#cmpPair',host);
    function load(){
      pair.innerHTML = '';
      const cur = list[idx];
      const items = Kit.shuffle([{e:cur.a, ok:cur.a===cur.big}, {e:cur.b, ok:cur.b===cur.big}]);
      items.forEach(it=>{
        const b = Kit.el('button','cmp-card', it.e);
        b.type = 'button';
        b.dataset.ok = it.ok ? '1' : '0';
        b.onclick = ()=>{
          if(b.classList.contains('done')) return;
          if(b.dataset.ok === '1'){
            b.classList.add('done','ok');
            AudioKit.correct(); AudioKit.star();
            AudioKit.speak('对，这个更大','zh-CN',0.8);
            api.addStars(1); right++;
            Kit.setBar('cmpBar', right/list.length*100);
            setTimeout(()=>{
              idx++;
              if(idx >= list.length){ api.finish('大小全比对啦！'); }
              else load();
            }, 1000);
          }else{
            b.classList.add('no');
            setTimeout(()=>b.classList.remove('no'), 450);
            AudioKit.wrong();
          }
        };
        pair.appendChild(b);
      });
      AudioKit.speak('哪个更大','zh-CN',0.85);
    }
    load();
  }
  return { render, title:'比大小', icon:'⚖️', hint:'找出更大的那个' };
})();