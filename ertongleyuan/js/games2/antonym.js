/* 语文5：反义词连线 */
const G_Antonym = (()=>{
  function render(host, api){
    const list = Kit.shuffle(DATA.chinese.antonyms).slice(0,6);
    host.innerHTML = '<div class="hint-bar">点左边的词，再点右边的反义词 🔗</div><div id="antBox"></div>';
    const left = list.map(x=>({
      key:x.a, html:'<span class="ln-emoji">'+x.pa+'</span><span class="ln-text">'+x.a+'</span>',
      speak: ()=>AudioKit.speak(x.a,'zh-CN',0.75)
    }));
    const right = list.map(x=>({
      key:x.a, html:'<span class="ln-emoji">'+x.pb+'</span><span class="ln-text">'+x.b+'</span>'
    }));
    Kit.makeLines(Kit.$('#antBox',host), left, right, (m,total)=>{
      api.addStars(1); api.progress();
      if(m===total) api.finish('反义词全连对啦！');
    });
  }
  return { render, title:'反义词连线', icon:'🔗', hint:'连出意思相反的字' };
})();