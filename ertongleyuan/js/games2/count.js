/* 数学1：数一数 */
const G_Count = (()=>{
  function render(host, api){
    const sets = Kit.shuffle(DATA.math.countItems).slice(0,5);
    host.innerHTML = '<div class="hint-bar">数一数有几个，把数字拖过去 🔢</div>'+
      '<div class="match-grid" style="grid-template-columns:minmax(130px,1fr) minmax(230px,2.6fr)">'+
      '<div class="match-col" id="ctL"></div><div class="match-col" id="ctR"></div></div>';
    const L = Kit.$('#ctL',host), R = Kit.$('#ctR',host);
    Kit.shuffle(sets).forEach(s=>{
      const t = Kit.el('div','tile', s.n);
      t.dataset.n = s.n;
      L.appendChild(t);
      Kit.makeDraggable(t,{
        zoneSelector:'.ct-drop',
        onPick: ()=>AudioKit.speak(String(s.n),'zh-CN',0.8),
        onDrop: (node,z)=>{
          if(node.dataset.n === z.dataset.n){
            z.classList.add('filled','correct');
            node.remove();
            AudioKit.correct();
            AudioKit.speak('对了，一共'+z.dataset.n+'个','zh-CN',0.8);
            api.addStars(1); api.progress();
            if(!L.querySelector('.tile')) api.finish('全部数对啦，数学小天才！');
          }else{
            z.classList.add('wrong'); setTimeout(()=>z.classList.remove('wrong'),480);
            AudioKit.wrong(); api.miss();
          }
        }
      });
    });
    Kit.shuffle(sets).forEach(s=>{
      const z = Kit.el('div','tile dropzone ct-drop');
      z.dataset.n = s.n;
      z.style.fontSize = '28px'; z.style.lineHeight = '1.35'; z.style.letterSpacing = '5px';
      z.innerHTML = '<div style="max-width:100%;text-align:center">'+s.emoji.repeat(s.n)+'</div>'+
                    '<div style="font-size:15px;color:#7b8bab;letter-spacing:0">'+s.cn+'</div>';
      R.appendChild(z);
    });
  }
  return { render, title:'数一数', icon:'🔢', hint:'数字配数量' };
})();