# 星际乐园 · 12 种动画玩法

面向小学生的自包含互动游戏网站。零构建、零 CDN 外链，双击 `index.html` 就能玩。

## 打开方式
双击 `index.html`。推荐 Chrome / Edge / Safari 最新版。

## 12 种动画玩法
🎡 幸运转盘 / 🧩 拼图板 / 🎨 大画笔 / 🔗 连线配对 / 🗂️ 拖拽分类 / 🥁 节奏点击
⚖️ 天平称重 / 🃏 翻牌记忆 / 🧪 管道拼接 / 🗺️ 迷宫寻宝 / 🫧 泡泡爆破 / 🧺 接住掉落

## 本轮修复（对应反馈：屏幕装不下 / 背景不适儿 / 互动弱）

### 1. 全屏自适应
- `css/style.css` 使用 `100dvh / 100svh` + flex 收缩 + `min-height:0`，替代固定 `100vh`
- `js/core/layout.js` 统一测量 `#stage` 可用宽高并广播 resize；12 个玩法全部从 layout 取尺寸
- 小屏自动降级：翻牌记忆 12 张→8 张、节奏点击 4 车道→3 车道
- 三视口实测 `overflowX=false`：320×568 / 768×1024 / 1440×900

### 2. 儿童向明亮背景
- 天空蓝→奶油黄渐变 + 右上太阳光晕
- 持续动画：漂浮云朵 × 5、上升泡泡 × 16、飘起气球 × 3
- 首屏 hero：卡通星球 + 站在星球上的小孩（眨眼/挥手）+ 摇摇飞船 + 环绕小星星

### 3. 互动与游戏感
- 全部玩法使用 Pointer Events + Canvas 逐帧绘制 + `touch-action:none`
- 得分：星星粒子爆裂 + WebAudio 合成音效 + 浮动提示 + 连击加成
- 失败：音效 + 抖动反馈；卡片逐张延迟入场
- `prefers-reduced-motion` 时自动关闭动效

## 技术要点
- 入口 `index.html` 只做装配，玩法按需注入
- 背景与首屏 hero 全部 Canvas 手绘，无外部图片
- 音效由 WebAudio 合成，无外部音频文件

## 交付目录
```
index.html
css/style.css
VERIFY.json
js/core/layout.js
js/core/engine.js
js/core/rewards.js
js/games/*.js     （12 个玩法）
```

## 自检回执
- 静态：`node _check_all.js` → JS_COUNT=29 / SYNTAX_ERRORS=NONE / GAMES_REGISTERED=12 / OVER_LIMIT=NONE
- 运行期：`node _verify_runtime.js` → 三视口 errors=[] / overflowX=false / cells=12 / wheelCanvas=true
