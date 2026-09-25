/* 英语2：颜色小画家（单词配颜色） */
const G_Color = (()=>{
  function render(host, api){
    const list = Kit.shuffle(DATA.math.colors).slice(0,6);
    host.innerHTML = `<div class="hint-bar">读一读颜色单词，拖到对应的颜色上 🎨</div>
      <div class="match-grid" style="grid-template-columns:minmax(150px,1fr) minmax(240px,2.4fr)">
        <div class="match-col" id="clL"></div>
        <div class="match-col" id="clR" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr))"></div></div>`;
    const L = Kit.$('#clL',host), R = Kit.$('#clR',host);
    Kit.shuffle(list).forEach(c=>{
      const t = Kit.el('div','tile', c.en);
      t.dataset.w = c.en;
      t.style.fontFamily = 'var(--font-num)';
      t.style.fontSize = 'clamp(18px,3vw,26px)';
      L.appendChild(t);
      Kit.makeDraggable(t,{
        zoneSelector:'.cl-drop',
        onPick: ()=>{ AudioKit.pick(); AudioKit.speak(c.en,'en-US',0.7); },
        onDrop: (node,z)=>{
          if(node.dataset.w === z.dataset.w){
            z.classList.add('filled','correct');
            z.innerHTML = '<span style="font-family:var(--font-num);font-size:22px;font-weight:900">'+z.dataset.w+'</span>';
            node.remove();
            AudioKit.correct();
            AudioKit.speak(z.dataset.w,'en-US',0.7);
            api.addStars(1); api.progress();
            if(!L.querySelector('.tile')) api.finish('Colours 全对，你是小画家！');
          }else{
            z.classList.add('wrong'); setTimeout(()=>z.classList.remove('wrong'),480);
            AudioKit.wrong(); api.miss();
          }
        }
      });
    });
    Kit.shuffle(list).forEach(c=>{
      const z = Kit.el('div','tile dropzone cl-drop');
      z.dataset.w = c.en;
      z.style.background = c.hex;
      z.style.border = '5px solid #fff';
      z.style.minHeight = '112px';
      z.style.color = c.hex === '#ffffff' || c.hex === '#ffd93d' ? '#5a4a00' : '#fff';
      z.style.textShadow = c.hex === '#ffffff' ? 'none' : '0 2px 6px rgba(0,0,0,.32)';
      z.innerHTML = '<span style="font-size:18px;font-weight:900">'+c.cn+'</span>';
      R.appendChild(z);
    });
  }
  return { render, title:'颜色小画家', icon:'🎨', hint:'拖颜色单词到色块' };
})();