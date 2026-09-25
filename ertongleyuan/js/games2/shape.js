/* 数学3：认识形状 */
const G_Shape = (()=>{
  function render(host, api){
    const list = DATA.math.shapes;
    let idx = 0, right = 0;
    host.innerHTML = `
      <div class="hint-bar">这个图形叫什么？点一点 👆</div>
      <div class="shape-stage">
        <div class="shape-icon" id="shIcon">⭕</div>
        <div class="shape-desc" id="shDesc"></div>
        <div class="shape-opts" id="shOpts"></div>
        <div class="progress-wrap" style="margin-top:20px"><div class="progress-bar" id="shBar"></div></div>
      </div>`;
    const icon = Kit.$('#shIcon',host), desc = Kit.$('#shDesc',host), opts = Kit.$('#shOpts',host);
    function load(){
      const cur = list[idx];
      icon.textContent = cur.icon;
      icon.style.animation = 'none'; void icon.offsetWidth;
      icon.style.animation = 'hop 1.6s ease-in-out infinite';
      desc.textContent = cur.desc;
      opts.innerHTML = '';
      const wrongs = Kit.shuffle(list.filter(x=>x.name !== cur.name)).slice(0,3);
      Kit.shuffle([cur, ...wrongs]).forEach(s=>{
        const b = Kit.el('button','opt-btn', s.name);
        b.type = 'button';
        b.onclick = ()=>{
          if(b.classList.contains('done')) return;
          if(s.name === cur.name){
            b.classList.add('done','ok');
            AudioKit.correct();
            AudioKit.speak(cur.name,'zh-CN',0.8);
            api.addStars(1); right++;
            Kit.setBar('shBar', right/list.length*100);
            setTimeout(()=>{
              idx = (idx+1) % list.length;
              if(right >= list.length){ api.finish('所有形状都认识啦！'); }
              else load();
            }, 900);
          }else{
            b.classList.add('no');
            setTimeout(()=>b.classList.remove('no'), 450);
            AudioKit.wrong();
          }
        };
        opts.appendChild(b);
      });
      AudioKit.speak('这是什么形状','zh-CN',0.85);
    }
    load();
  }
  return { render, title:'认识形状', icon:'⬜', hint:'认识各种图形' };
})();