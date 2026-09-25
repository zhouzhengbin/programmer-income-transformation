/* ============================================================
   拖拽引擎 v2：统一处理鼠标 + 触摸
   落点判定改为「几何包含测试」，不再依赖 elementFromPoint
   （elementFromPoint 在指针捕获时会返回源元素，导致找不到目标）
   ============================================================ */
const DragKit = (() => {
  let ghost = null;
  let active = null;
  let currentZone = null;

  function zones(selector){
    return [...document.querySelectorAll(selector)];
  }

  // 用坐标做矩形包含判定，取命中的最上层（最后渲染的）区域
  function hitTest(x, y, selector){
    const list = zones(selector);
    let hit = null;
    for(const z of list){
      const r = z.getBoundingClientRect();
      if(x >= r.left && x <= r.right && y >= r.top && y <= r.bottom){
        if(!z.classList.contains('filled')) hit = z;
      }
    }
    return hit;
  }

  function onDown(e){
    const el = e.currentTarget;
    const cfg = el.__dragCfg;
    if(!cfg || el.classList.contains('locked')) return;
    if(e.button !== undefined && e.button !== 0) return;

    const p = e;
    active = { el, cfg, startX: p.clientX, startY: p.clientY };

    if(el.setPointerCapture && e.pointerId != null){
      try{ el.setPointerCapture(e.pointerId); }catch(err){}
    }

    const rect = el.getBoundingClientRect();
    ghost = el.cloneNode(true);
    ghost.style.cssText += 'position:fixed;left:' + rect.left + 'px;top:' + rect.top + 'px;' +
      'width:' + rect.width + 'px;height:' + rect.height + 'px;pointer-events:none;z-index:300;' +
      'opacity:.92;transform:scale(1.12) rotate(4deg);transition:none;margin:0;';
    document.body.appendChild(ghost);
    el.classList.add('dragging');

    if(cfg.onPick) cfg.onPick(el);

    document.addEventListener('pointermove', onMove, {passive:false});
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  }

  function onMove(e){
    if(!active || !ghost) return;
    e.preventDefault();
    const p = e;
    const r = active.el.getBoundingClientRect();
    ghost.style.left = (p.clientX - r.width/2) + 'px';
    ghost.style.top  = (p.clientY - r.height/2) + 'px';

    const zone = hitTest(p.clientX, p.clientY, active.cfg.zoneSelector);
    if(zone !== currentZone){
      if(currentZone) currentZone.classList.remove('over');
      currentZone = zone;
      if(currentZone) currentZone.classList.add('over');
    }
  }

  function onUp(e){
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    document.removeEventListener('pointercancel', onUp);
    if(!active) return;

    const zone = hitTest(e.clientX, e.clientY, active.cfg.zoneSelector);
    const cfg = active.cfg;
    const el = active.el;

    if(ghost){ ghost.remove(); ghost = null; }
    el.classList.remove('dragging');
    if(currentZone){ currentZone.classList.remove('over'); currentZone = null; }
    active = null;

    if(zone && cfg.onDrop) cfg.onDrop(el, zone);
    else if(cfg.onCancel) cfg.onCancel(el);
  }

  function enable(el, cfg){
    el.__dragCfg = cfg;
    el.classList.add('draggable');
    el.addEventListener('pointerdown', onDown);
    return el;
  }

  function lock(el){ el.classList.add('locked'); el.style.cursor = 'default'; }
  function unlock(el){ el.classList.remove('locked'); el.style.cursor = 'grab'; }

  return { enable, lock, unlock, hitTest };
})();
