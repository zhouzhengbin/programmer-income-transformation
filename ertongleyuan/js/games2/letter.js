/* 英语1：字母开头配 */
const G_Letter = (()=>{
  function render(host, api){
    const list = Kit.shuffle(DATA.english.letterWords).slice(0,6);
    host.innerHTML = `<div class="hint-bar">这个单词以哪个字母开头？拖过去 🔤</div>
      <div class="match-grid" style="grid-template-columns:minmax(130px,1fr) minmax(220px,2.6fr)">
        <div class="match-col" id="ltL"></div><div class="match-col" id="ltR"></div></div>`;
    const L = Kit.$('#ltL',host), R = Kit.$('#ltR',host);
    Kit.shuffle(list).forEach(w=>{
      const t = Kit.el('div','tile', w.L);
      t.dataset.l = w.L;
      L.appendChild(t);
      Kit.makeDraggable(t,{
        zoneSelector:'.lt-drop',
        onPick: ()=>{ AudioKit.pick(); AudioKit.speak(w.L,'en-US',0.7); },
        onDrop: (node,z)=>{
          if(node.dataset.l === z.dataset.l){
            z.classList.add('filled','correct');
            node.remove();
            AudioKit.correct();
            AudioKit.speak(z.dataset.word,'en-US',0.72);
            api.addStars(1); api.progress();
            if(!L.querySelector('.tile')) api.finish('Perfect! 字母全对啦！');
          }else{
            z.classList.add('wrong'); setTimeout(()=>z.classList.remove('wrong'),480);
            AudioKit.wrong(); api.miss();
          }
        }
      });
    });
    Kit.shuffle(list).forEach(w=>{
      const z = Kit.el('div','tile dropzone lt-drop');
      z.dataset.l = w.L; z.dataset.word = w.word;
      z.innerHTML = `<span style="font-size:40px">${w.pic}</span>
        <span style="font-family:var(--font-num);font-size:19px;color:#2fa855;font-weight:900">${w.word}</span>
        <span style="font-size:13px;color:#7b8bab">${w.cn}</span>`;
      R.appendChild(z);
    });
  }
  return { render, title:'字母开头配', icon:'🔤', hint:'拖字母到对应单词' };
})();