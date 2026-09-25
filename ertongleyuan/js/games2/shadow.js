/* 常识1：影子配对 */
const G_Shadow = (()=>{
  function render(host, api){
    const list = Kit.shuffle(DATA.common.shadows).slice(0,5);
    host.innerHTML = `<div class="hint-bar">把左边的物品，拖到右边它的影子上 🌑</div>
      <div class="match-grid" style="grid-template-columns:minmax(120px,1fr) minmax(120px,1fr)">
        <div class="match-col" id="shL"></div><div class="match-col" id="shR"></div></div>`;
    const L = Kit.$('#shL',host), R = Kit.$('#shR',host);
    Kit.shuffle(list).forEach(s=>{
      const t = Kit.el('div','tile', s.item);
      t.dataset.k = s.name;
      t.style.fontSize = '44px';
      L.appendChild(t);
      Kit.makeDraggable(t,{
        zoneSelector:'.sh-drop',
        onPick: ()=>{ AudioKit.pick(); AudioKit.speak(s.name,'zh-CN',0.8); },
        onDrop: (node,z)=>{
          if(node.dataset.k === z.dataset.k){
            z.classList.add('filled','correct');
            z.innerHTML = '<span style="font-size:44px">'+node.textContent+'</span>';
            node.remove();
            AudioKit.correct();
            AudioKit.speak('对了，这是'+z.dataset.k,'zh-CN',0.8);
            api.addStars(1); api.progress();
            if(!L.querySelector('.tile')) api.finish('影子全找对啦！');
          }else{
            z.classList.add('wrong'); setTimeout(()=>z.classList.remove('wrong'),480);
            AudioKit.wrong(); api.miss();
          }
        }
      });
    });
    Kit.shuffle(list).forEach(s=>{
      const z = Kit.el('div','tile dropzone sh-drop');
      z.dataset.k = s.name;
      z.setAttribute('aria-label', s.name + '的影子');
      z.innerHTML = '<span class="shadow-figure" aria-hidden="true">'+s.item+'</span>';
      R.appendChild(z);
    });
  }
  return { render, title:'影子配对', icon:'🌑', hint:'找出物品的影子' };
})();
