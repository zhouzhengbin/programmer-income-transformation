/* 数学6：认识钟表 */
const G_Clock = (()=>{
  function render(host, api){
    let idx = 0, right = 0;
    const list = DATA.math.clocks;
    host.innerHTML = `
      <div class="hint-bar">现在几点？点一点 🕐</div>
      <div class="clock-stage">
        <div class="clock-face" id="ckFace"></div>
        <div class="clock-opts" id="ckOpts"></div>
        <div class="progress-wrap" style="margin-top:20px"><div class="progress-bar" id="ckBar"></div></div>
      </div>`;
    const face = Kit.$('#ckFace',host), opts = Kit.$('#ckOpts',host);
    function draw(h, m){
      face.innerHTML = '';
      // 刻度
      for(let i=0;i<12;i++){
        const a = i * Math.PI/6 - Math.PI/2;
        const num = Kit.el('div','clock-num', String(i===0?12:i));
        num.style.left = (50 + 40*Math.cos(a)) + '%';
        num.style.top  = (50 + 40*Math.sin(a)) + '%';
        face.appendChild(num);
      }
      // 时针
      const hh = Kit.el('div','clock-hand hour');
      hh.style.transform = 'rotate(' + ((h%12)*30 + m*0.5) + 'deg)';
      face.appendChild(hh);
      // 分针
      const mh = Kit.el('div','clock-hand minute');
      mh.style.transform = 'rotate(' + (m*6) + 'deg)';
      face.appendChild(mh);
      // 中心
      face.appendChild(Kit.el('div','clock-dot'));
    }
    function load(){
      const cur = list[idx];
      draw(cur.h, cur.m);
      opts.innerHTML = '';
      const others = Kit.shuffle(list.filter(x=>x.label !== cur.label)).slice(0,3);
      Kit.shuffle([cur, ...others]).forEach(c=>{
        const b = Kit.el('button','opt-btn', c.label);
        b.type = 'button';
        b.onclick = ()=>{
          if(b.classList.contains('done')) return;
          if(c.label === cur.label){
            b.classList.add('done','ok');
            AudioKit.correct();
            AudioKit.speak('对了，'+cur.label,'zh-CN',0.85);
            api.addStars(1); right++;
            Kit.setBar('ckBar', right/list.length*100);
            setTimeout(()=>{
              idx++;
              if(idx >= list.length){ api.finish('钟表全认对啦！'); }
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
      AudioKit.speak('现在是几点','zh-CN',0.85);
    }
    load();
  }
  return { render, title:'认识钟表', icon:'🕐', hint:'看钟表认时间' };
})();