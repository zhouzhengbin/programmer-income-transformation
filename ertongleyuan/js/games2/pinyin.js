/* 语文1：拼音找朋友 —— 拖声母到对应图片 */
const G_Pinyin = (()=>{
  function render(host, api){
    const list = Kit.shuffle(DATA.chinese.pinyinWords).slice(0,6);
    host.innerHTML = `<div class="hint-bar">把左边的拼音拖到右边对应的图片上 👉</div>
      <div class="match-grid" style="grid-template-columns:minmax(140px,1fr) minmax(220px,2.4fr)">
        <div class="match-col" id="pyL"></div><div class="match-col" id="pyR"></div></div>`;
    const L = Kit.$('#pyL',host), R = Kit.$('#pyR',host);
    Kit.shuffle(list).forEach(w=>{
      const t = Kit.el('div','tile', w.ini);
      t.dataset.ini = w.ini;
      L.appendChild(t);
      Kit.makeDraggable(t,{
        zoneSelector:'.py-drop',
        onPick: ()=>AudioKit.speakPinyin(w.ini),
        onDrop: (node,z)=>{
          if(z.dataset.ini === node.dataset.ini){
            z.classList.add('filled','correct');
            node.remove();
            AudioKit.correct();
            AudioKit.speakSyllable(z.dataset.py);
            api.addStars(1); api.progress();
            if(!L.querySelector('.tile')){ api.finish('拼音全找对啦！'); }
          }else{
            z.classList.add('wrong'); setTimeout(()=>z.classList.remove('wrong'),480);
            AudioKit.wrong(); api.miss();
          }
        }
      });
    });
    Kit.shuffle(list).forEach(w=>{
      const z = Kit.el('div','tile dropzone py-drop');
      z.dataset.ini = w.ini; z.dataset.py = w.py;
      z.innerHTML = `<span style="font-size:42px">${w.pic}</span>
        <span style="font-size:17px;font-weight:800;color:#3d5480;margin-top:2px">${w.word} ${w.py}</span>`;
      R.appendChild(z);
    });
  }
  return { render, title:'拼音找朋友', icon:'🔤', hint:'拖声母配对图片' };
})();