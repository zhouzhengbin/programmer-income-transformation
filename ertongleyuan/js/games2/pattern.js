/* 数学5：找规律 */
const G_Pattern = (()=>{
  function render(host, api){
    let idx = 0, right = 0;
    const list = Kit.shuffle(DATA.math.patterns).slice(0,5);
    host.innerHTML = `
      <div class="hint-bar">接下来是什么？点一点 🧩</div>
      <div class="pat-stage">
        <div class="pat-row" id="patRow"></div>
        <div class="pat-opts" id="patOpts"></div>
        <div class="progress-wrap" style="margin-top:20px"><div class="progress-bar" id="patBar"></div></div>
      </div>`;
    const row = Kit.$('#patRow',host), opts = Kit.$('#patOpts',host);
    function load(){
      const cur = list[idx];
      row.innerHTML = '';
      cur.seq.forEach((s,i)=>{
        const c = Kit.el('div','pat-cell', s);
        c.style.animationDelay = (i*0.08)+'s';
        row.appendChild(c);
      });
      const q = Kit.el('div','pat-cell pat-q','?');
      row.appendChild(q);
      opts.innerHTML = '';
      const wrongs = Kit.shuffle(['🔴','🔵','⭐','🌙','🍎','🐶','🔺','⬜'].filter(x=>x!==cur.next)).slice(0,3);
      Kit.shuffle([cur.next, ...wrongs]).forEach(sym=>{
        const b = Kit.el('button','pat-opt', sym);
        b.type = 'button';
        b.onclick = ()=>{
          if(b.classList.contains('done')) return;
          if(sym === cur.next){
            b.classList.add('done','ok');
            q.textContent = sym; q.classList.add('filled');
            AudioKit.correct(); AudioKit.star();
            api.addStars(1); right++;
            Kit.setBar('patBar', right/list.length*100);
            setTimeout(()=>{
              idx++;
              if(idx >= list.length){ api.finish('规律全找对啦！'); }
              else load();
            }, 1000);
          }else{
            b.classList.add('no');
            setTimeout(()=>b.classList.remove('no'), 450);
            AudioKit.wrong();
          }
        };
        opts.appendChild(b);
      });
      AudioKit.speak('接下来是什么','zh-CN',0.85);
    }
    load();
  }
  return { render, title:'找规律', icon:'🧩', hint:'找出排列规律' };
})();