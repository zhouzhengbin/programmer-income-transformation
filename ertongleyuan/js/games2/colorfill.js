/* 英语4：涂色乐园（Canvas 区域填色） */
const G_ColorFill = (()=>{
  const PICS = [
    { name:'小房子', parts:[
      { type:'poly', pts:[[40,110],[150,40],[260,110]], label:'屋顶', lx:150, ly:90 },
      { type:'poly', pts:[[70,110],[70,230],[230,230],[230,110]], label:'墙', lx:150, ly:175 },
      { type:'poly', pts:[[170,160],[170,215],[215,215],[215,160]], label:'门', lx:192, ly:192 },
    ]},
    { name:'小汽车', parts:[
      { type:'poly', pts:[[40,160],[90,100],[210,100],[260,160]], label:'车身', lx:150, ly:135 },
      { type:'circle', x:105, y:190, r:26, label:'轮子', lx:105, ly:194 },
      { type:'circle', x:215, y:190, r:26, label:'轮子', lx:215, ly:194 },
    ]},
    { name:'小花朵', parts:[
      { type:'circle', x:150, y:110, r:34, label:'花瓣', lx:150, ly:114 },
      { type:'circle', x:100, y:150, r:34, label:'花瓣', lx:100, ly:154 },
      { type:'circle', x:200, y:150, r:34, label:'花瓣', lx:200, ly:154 },
      { type:'poly', pts:[[150,140],[150,250]], label:'花茎', lx:170, ly:210 },
    ]},
  ];
  function render(host, api){
    const pic = Kit.pick(PICS);
    let filledAll = false;
    const regions = pic.parts.map(p=>Object.assign({}, p));
    host.innerHTML = `
      <div class="hint-bar">选一个颜色，点图画上色 🖌️</div>
      <div class="fill-wrap">
        <div>
          <canvas id="flCv" width="300" height="280" class="fill-canvas"></canvas>
        </div>
        <div class="fill-side">
          <div class="fill-title">${pic.name}</div>
          <div class="palette" id="flPal"></div>
          <button class="chip" id="flClear">🧹 全部擦掉</button>
          <button class="chip" id="flNew">换一张图</button>
          <div class="progress-wrap" style="margin-top:14px"><div class="progress-bar" id="flBar"></div></div>
          <div class="fill-tip" id="flTip">用鼠标或手指点区域就能上色</div>
        </div>
      </div>`;
    const cv = Kit.$('#flCv',host), pal = Kit.$('#flPal',host);
    const palette = DATA.math.colors.slice(0,8).map(c=>c.hex);
    let painter = null;
    palette.forEach((hex,i)=>{
      const b = Kit.el('button','pal-dot' + (i===0?' active':''));
      b.type='button';
      b.style.background = hex;
      b.style.border = hex === '#ffffff' ? '3px solid #d6e2f0' : '3px solid #fff';
      b.onclick = ()=>{
        pal.querySelectorAll('.pal-dot').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        painter.setColor(hex);
        AudioKit.click();
      };
      pal.appendChild(b);
    });
    painter = Kit.makeColoring(cv, regions, palette, (done)=>{
      Kit.setBar('flBar', painter.progress());
      if(done && !filledAll){
        filledAll = true;
        api.addStars(3); api.progress();
        AudioKit.star();
        api.finish('图画涂完啦，真漂亮！');
      }
    });
    Kit.$('#flClear',host).onclick = ()=>{ painter.reset(); filledAll=false; Kit.setBar('flBar',0); AudioKit.click(); };
    Kit.$('#flNew',host).onclick = ()=>{ AudioKit.click(); render(host,api); };
  }
  return { render, title:'涂色乐园', icon:'🖌️', hint:'给图画涂上颜色' };
})();