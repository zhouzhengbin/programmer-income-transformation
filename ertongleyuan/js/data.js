/* ============================================================
   题库中心 v2 —— 覆盖幼儿园小班到大班的知识面
   参考人教版幼儿园教材的领域划分：
     健康 / 语言 / 社会 / 科学 / 艺术
   这里落地为可玩的语文、数学、英语三大板块
   ============================================================ */
const DATA = {

/* ================= 语文 ================= */
chinese: {
  // 声母（23个）
  shengmu: ['b','p','m','f','d','t','n','l','g','k','h','j','q','x',
            'zh','ch','sh','r','z','c','s','y','w'],
  // 韵母（24个）
  yunmu: ['a','o','e','i','u','ü','ai','ei','ui','ao','ou','iu',
          'ie','üe','er','an','en','in','un','ün','ang','eng','ing','ong'],
  // 整体认读音节（16个）
  zhengti: ['zhi','chi','shi','ri','zi','ci','si','yi','wu','yu',
            'ye','yue','yuan','yin','yun','ying'],

  // 拼音 + 图 + 词 + 声调
  pinyinWords: [
    { py:'bà',  word:'爸', pic:'👨', ini:'b', tone:4 },
    { py:'mā',  word:'妈', pic:'👩', ini:'m', tone:1 },
    { py:'mǎ',  word:'马', pic:'🐴', ini:'m', tone:3 },
    { py:'yú',  word:'鱼', pic:'🐟', ini:'y', tone:2 },
    { py:'huā', word:'花', pic:'🌺', ini:'h', tone:1 },
    { py:'xiàng', word:'象', pic:'🐘', ini:'x', tone:4 },
    { py:'guǒ', word:'果', pic:'🍎', ini:'g', tone:3 },
    { py:'tù',  word:'兔', pic:'🐰', ini:'t', tone:4 },
    { py:'niǎo',word:'鸟', pic:'🐦', ini:'n', tone:3 },
    { py:'shù', word:'树', pic:'🌳', ini:'sh', tone:4 },
    { py:'yuè', word:'月', pic:'🌙', ini:'y', tone:4 },
    { py:'rì',  word:'日', pic:'☀️', ini:'r', tone:4 },
    { py:'shān',word:'山', pic:'⛰️', ini:'sh', tone:1 },
    { py:'shuǐ',word:'水', pic:'💧', ini:'sh', tone:3 },
    { py:'huǒ', word:'火', pic:'🔥', ini:'h', tone:3 },
    { py:'tǔ',  word:'土', pic:'🟫', ini:'t', tone:3 },
    { py:'yún', word:'云', pic:'☁️', ini:'y', tone:2 },
    { py:'yǔ',  word:'雨', pic:'🌧️', ini:'y', tone:3 },
    { py:'xuě', word:'雪', pic:'❄️', ini:'x', tone:3 },
    { py:'fēng',word:'风', pic:'🍃', ini:'f', tone:1 },
    { py:'cǎo', word:'草', pic:'🌿', ini:'c', tone:3 },
    { py:'chóng',word:'虫', pic:'🐛', ini:'ch', tone:2 },
    { py:'gǒu', word:'狗', pic:'🐶', ini:'g', tone:3 },
    { py:'māo', word:'猫', pic:'🐱', ini:'m', tone:1 },
  ],

  // 汉字（含笔顺用点阵）
  hanzi: [
    { ch:'一', py:'yī',  mean:'数字一',    strokes:1, pts:[[30,100],[170,100]] },
    { ch:'二', py:'èr',  mean:'数字二',    strokes:2, pts:[[40,70],[160,70]] },
    { ch:'十', py:'shí', mean:'数字十',    strokes:2, pts:[[100,30],[100,170]] },
    { ch:'人', py:'rén', mean:'人',        strokes:2, pts:[[55,35],[145,165]] },
    { ch:'大', py:'dà',  mean:'大小的大',  strokes:3, pts:[[60,40],[140,160]] },
    { ch:'小', py:'xiǎo',mean:'大小的小',  strokes:3, pts:[[100,40],[100,160]] },
    { ch:'口', py:'kǒu', mean:'嘴巴',      strokes:3, pts:[[60,50],[140,50],[140,150],[60,150],[60,50]] },
    { ch:'日', py:'rì',  mean:'太阳',      strokes:4, pts:[[65,45],[135,45],[135,155],[65,155],[65,45]] },
    { ch:'月', py:'yuè', mean:'月亮',      strokes:4, pts:[[70,40],[70,160]] },
    { ch:'上', py:'shàng',mean:'上面',     strokes:3, pts:[[100,40],[100,160]] },
    { ch:'下', py:'xià', mean:'下面',      strokes:3, pts:[[100,40],[100,160]] },
    { ch:'火', py:'huǒ', mean:'火',        strokes:4, pts:[[100,55],[100,150]] },
    { ch:'水', py:'shuǐ',mean:'水',        strokes:4, pts:[[100,40],[100,160]] },
    { ch:'山', py:'shān',mean:'山',        strokes:3, pts:[[50,150],[100,60],[150,150]] },
    { ch:'木', py:'mù',  mean:'树木',      strokes:4, pts:[[100,35],[100,165]] },
    { ch:'土', py:'tǔ',  mean:'泥土',      strokes:3, pts:[[50,110],[150,110]] },
  ],

  // 古诗（幼儿园必背）
  poems: [
    { title:'咏鹅', author:'骆宾王', dynasty:'唐',
      lines:['鹅，鹅，鹅，','曲项向天歌。','白毛浮绿水，','红掌拨清波。'],
      emoji:'🦢' },
    { title:'静夜思', author:'李白', dynasty:'唐',
      lines:['床前明月光，','疑是地上霜。','举头望明月，','低头思故乡。'],
      emoji:'🌕' },
    { title:'春晓', author:'孟浩然', dynasty:'唐',
      lines:['春眠不觉晓，','处处闻啼鸟。','夜来风雨声，','花落知多少。'],
      emoji:'🌸' },
    { title:'悯农', author:'李绅', dynasty:'唐',
      lines:['锄禾日当午，','汗滴禾下土。','谁知盘中餐，','粒粒皆辛苦。'],
      emoji:'🌾' },
    { title:'登鹳雀楼', author:'王之涣', dynasty:'唐',
      lines:['白日依山尽，','黄河入海流。','欲穷千里目，','更上一层楼。'],
      emoji:'🏔️' },
    { title:'江雪', author:'柳宗元', dynasty:'唐',
      lines:['千山鸟飞绝，','万径人踪灭。','孤舟蓑笠翁，','独钓寒江雪。'],
      emoji:'❄️' },
    { title:'画', author:'王维', dynasty:'唐',
      lines:['远看山有色，','近听水无声。','春去花还在，','人来鸟不惊。'],
      emoji:'🖼️' },
    { title:'池上', author:'白居易', dynasty:'唐',
      lines:['小娃撑小艇，','偷采白莲回。','不解藏踪迹，','浮萍一道开。'],
      emoji:'🛶' },
    { title:'相思', author:'王维', dynasty:'唐',
      lines:['红豆生南国，','春来发几枝。','愿君多采撷，','此物最相思。'],
      emoji:'🫘' },
    { title:'寻隐者不遇', author:'贾岛', dynasty:'唐',
      lines:['松下问童子，','言师采药去。','只在此山中，','云深不知处。'],
      emoji:'⛰️' },
    { title:'村居', author:'高鼎', dynasty:'清',
      lines:['草长莺飞二月天，','拂堤杨柳醉春烟。','儿童散学归来早，','忙趁东风放纸鸢。'],
      emoji:'🪁' },
    { title:'小池', author:'杨万里', dynasty:'宋',
      lines:['泉眼无声惜细流，','树阴照水爱晴柔。','小荷才露尖尖角，','早有蜻蜓立上头。'],
      emoji:'🪷' },
    { title:'咏柳', author:'贺知章', dynasty:'唐',
      lines:['碧玉妆成一树高，','万条垂下绿丝绦。','不知细叶谁裁出，','二月春风似剪刀。'],
      emoji:'🌿' },
    { title:'赠汪伦', author:'李白', dynasty:'唐',
      lines:['李白乘舟将欲行，','忽闻岸上踏歌声。','桃花潭水深千尺，','不及汪伦送我情。'],
      emoji:'⛵' },
    { title:'鹿柴', author:'王维', dynasty:'唐',
      lines:['空山不见人，','但闻人语响。','返景入深林，','复照青苔上。'],
      emoji:'🦌' },
    { title:'绝句', author:'杜甫', dynasty:'唐',
      lines:['两个黄鹂鸣翠柳，','一行白鹭上青天。','窗含西岭千秋雪，','门泊东吴万里船。'],
      emoji:'🐦' },
  ],

  // 儿歌
  songs: [
    { title:'小星星', emoji:'⭐',
      lines:['一闪一闪亮晶晶，','满天都是小星星。','挂在天上放光明，','好像许多小眼睛。'] },
    { title:'小燕子', emoji:'🐦',
      lines:['小燕子，穿花衣，','年年春天来这里。','我问燕子你为啥来，','燕子说，这里的春天最美丽。'] },
    { title:'数鸭子', emoji:'🦆',
      lines:['门前大桥下，','游过一群鸭。','快来快来数一数，','二四六七八。'] },
    { title:'两只老虎', emoji:'🐯',
      lines:['两只老虎，两只老虎，','跑得快，跑得快。','一只没有耳朵，','一只没有尾巴，真奇怪。'] },
    { title:'拔萝卜', emoji:'🥕',
      lines:['拔萝卜，拔萝卜，','嘿哟嘿哟拔萝卜。','嘿哟嘿哟拔不动，','老太婆，快快来。'] },
  ],

  // 反义词
  antonyms: [
    { a:'大', b:'小', pa:'🔵', pb:'🔹' },
    { a:'上', b:'下', pa:'⬆️', pb:'⬇️' },
    { a:'多', b:'少', pa:'🍎🍎🍎', pb:'🍎' },
    { a:'高', b:'矮', pa:'🦒', pb:'🐭' },
    { a:'长', b:'短', pa:'📏', pb:'✂️' },
    { a:'快', b:'慢', pa:'🐇', pb:'🐢' },
    { a:'黑', b:'白', pa:'⬛', pb:'⬜' },
    { a:'冷', b:'热', pa:'🧊', pb:'🔥' },
    { a:'前', b:'后', pa:'👀', pb:'🔙' },
    { a:'里', b:'外', pa:'🏠', pb:'🌳' },
  ],

  // 量词
  measure: [
    { item:'🐟', name:'鱼', unit:'条' },
    { item:'🐴', name:'马', unit:'匹' },
    { item:'🐮', name:'牛', unit:'头' },
    { item:'🐑', name:'羊', unit:'只' },
    { item:'🌸', name:'花', unit:'朵' },
    { item:'🌳', name:'树', unit:'棵' },
    { item:'📚', name:'书', unit:'本' },
    { item:'✏️', name:'笔', unit:'支' },
    { item:'🍚', name:'米', unit:'粒' },
    { item:'💧', name:'水', unit:'滴' },
  ],
},

/* ================= 数学 ================= */
math: {
  numbers: [1,2,3,4,5,6,7,8,9,10],
  // 数字 + 数量 + 中文
  countItems: [
    { n:1,  emoji:'🐤', cn:'一' }, { n:2,  emoji:'🍓', cn:'二' },
    { n:3,  emoji:'🐞', cn:'三' }, { n:4,  emoji:'🎈', cn:'四' },
    { n:5,  emoji:'⭐', cn:'五' }, { n:6,  emoji:'🐠', cn:'六' },
    { n:7,  emoji:'🌻', cn:'七' }, { n:8,  emoji:'🍇', cn:'八' },
    { n:9,  emoji:'🦋', cn:'九' }, { n:10, emoji:'🍒', cn:'十' },
  ],
  // 形状
  shapes: [
    { name:'圆形',   icon:'⭕', sides:0, desc:'圆圆的，没有角' },
    { name:'正方形', icon:'⬜', sides:4, desc:'四条边一样长' },
    { name:'三角形', icon:'🔺', sides:3, desc:'三条边三个角' },
    { name:'长方形', icon:'▬', sides:4, desc:'长长方方的' },
    { name:'星形',   icon:'⭐', sides:10, desc:'闪闪发光的星星' },
    { name:'心形',   icon:'❤️', sides:0, desc:'爱心形状' },
    { name:'菱形',   icon:'🔷', sides:4, desc:'四个角尖尖的' },
    { name:'椭圆',   icon:'🥚', sides:0, desc:'像鸡蛋一样' },
  ],
  // 颜色
  colors: [
    { cn:'红色', en:'red',    hex:'#ff5a5a' },
    { cn:'黄色', en:'yellow', hex:'#ffd93d' },
    { cn:'蓝色', en:'blue',   hex:'#4aa8ff' },
    { cn:'绿色', en:'green',  hex:'#4ecb71' },
    { cn:'紫色', en:'purple', hex:'#a06bff' },
    { cn:'橙色', en:'orange', hex:'#ffa552' },
    { cn:'粉色', en:'pink',   hex:'#ff8fd0' },
    { cn:'棕色', en:'brown',  hex:'#a5714a' },
    { cn:'黑色', en:'black',  hex:'#3a3a3a' },
    { cn:'白色', en:'white',  hex:'#ffffff' },
  ],
  // 比大小
  compare: [
    { a:'🐘', b:'🐭', big:'🐘' },
    { a:'🦒', b:'🐢', big:'🦒' },
    { a:'🏀', b:'⚽', big:'🏀' },
    { a:'🍉', b:'🍒', big:'🍉' },
    { a:'🌳', b:'🌱', big:'🌳' },
    { a:'🚌', b:'🚗', big:'🚌' },
  ],
  // 时钟
  clocks: [
    { h:3,  m:0,  label:'三点整' },
    { h:6,  m:0,  label:'六点整' },
    { h:9,  m:0,  label:'九点整' },
    { h:12, m:0,  label:'十二点整' },
  ],
  // 找规律
  patterns: [
    { seq:['🔴','🔵','🔴','🔵'], next:'🔴' },
    { seq:['⭐','⭐','🌙','⭐','⭐'], next:'🌙' },
    { seq:['🍎','🍌','🍎','🍌'], next:'🍎' },
    { seq:['🐶','🐱','🐶','🐱'], next:'🐶' },
    { seq:['🔺','⬜','🔺','⬜'], next:'🔺' },
  ],
  // 10以内加减
  addSubMax: 10,
},

/* ================= 英语 ================= */
english: {
  letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  // 字母 + 单词 + 图
  letterWords: [
    { L:'A', word:'apple',    cn:'苹果', pic:'🍎' },
    { L:'B', word:'bear',     cn:'熊',   pic:'🐻' },
    { L:'C', word:'cat',      cn:'猫',   pic:'🐱' },
    { L:'D', word:'dog',      cn:'狗',   pic:'🐶' },
    { L:'E', word:'elephant', cn:'大象', pic:'🐘' },
    { L:'F', word:'fish',     cn:'鱼',   pic:'🐟' },
    { L:'G', word:'grape',    cn:'葡萄', pic:'🍇' },
    { L:'H', word:'horse',    cn:'马',   pic:'🐴' },
    { L:'I', word:'ice',      cn:'冰',   pic:'🧊' },
    { L:'J', word:'juice',    cn:'果汁', pic:'🧃' },
    { L:'K', word:'kite',     cn:'风筝', pic:'🪁' },
    { L:'L', word:'lion',     cn:'狮子', pic:'🦁' },
    { L:'M', word:'moon',     cn:'月亮', pic:'🌙' },
    { L:'N', word:'nose',     cn:'鼻子', pic:'👃' },
    { L:'O', word:'orange',   cn:'橙子', pic:'🍊' },
    { L:'P', word:'pig',      cn:'猪',   pic:'🐷' },
    { L:'Q', word:'queen',    cn:'女王', pic:'👑' },
    { L:'R', word:'rabbit',   cn:'兔子', pic:'🐰' },
    { L:'S', word:'sun',      cn:'太阳', pic:'☀️' },
    { L:'T', word:'tree',     cn:'树',   pic:'🌳' },
    { L:'U', word:'umbrella', cn:'雨伞', pic:'☂️' },
    { L:'V', word:'van',      cn:'货车', pic:'🚐' },
    { L:'W', word:'water',    cn:'水',   pic:'💧' },
    { L:'X', word:'box',      cn:'箱子', pic:'📦' },
    { L:'Y', word:'yellow',   cn:'黄色', pic:'💛' },
    { L:'Z', word:'zebra',    cn:'斑马', pic:'🦓' },
  ],
  // 动物
  animals: [
    { en:'cat', cn:'猫', pic:'🐱' }, { en:'dog', cn:'狗', pic:'🐶' },
    { en:'pig', cn:'猪', pic:'🐷' }, { en:'duck', cn:'鸭', pic:'🦆' },
    { en:'bird', cn:'鸟', pic:'🐦' }, { en:'fish', cn:'鱼', pic:'🐟' },
    { en:'rabbit', cn:'兔', pic:'🐰' }, { en:'tiger', cn:'虎', pic:'🐯' },
    { en:'panda', cn:'熊猫', pic:'🐼' }, { en:'monkey', cn:'猴', pic:'🐵' },
    { en:'bear', cn:'熊', pic:'🐻' }, { en:'cow', cn:'牛', pic:'🐮' },
  ],
  // 水果
  fruits: [
    { en:'apple', cn:'苹果', pic:'🍎' }, { en:'banana', cn:'香蕉', pic:'🍌' },
    { en:'orange', cn:'橙子', pic:'🍊' }, { en:'grape', cn:'葡萄', pic:'🍇' },
    { en:'pear', cn:'梨', pic:'🍐' }, { en:'peach', cn:'桃', pic:'🍑' },
    { en:'watermelon', cn:'西瓜', pic:'🍉' }, { en:'strawberry', cn:'草莓', pic:'🍓' },
  ],
  // 数字英文
  numbers: [
    { n:1, en:'one', cn:'一' }, { n:2, en:'two', cn:'二' },
    { n:3, en:'three', cn:'三' }, { n:4, en:'four', cn:'四' },
    { n:5, en:'five', cn:'五' }, { n:6, en:'six', cn:'六' },
    { n:7, en:'seven', cn:'七' }, { n:8, en:'eight', cn:'八' },
    { n:9, en:'nine', cn:'九' }, { n:10, en:'ten', cn:'十' },
  ],
  // 身体部位
  body: [
    { en:'eye', cn:'眼睛', pic:'👁️' }, { en:'nose', cn:'鼻子', pic:'👃' },
    { en:'mouth', cn:'嘴巴', pic:'👄' }, { en:'ear', cn:'耳朵', pic:'👂' },
    { en:'hand', cn:'手', pic:'✋' }, { en:'foot', cn:'脚', pic:'🦶' },
  ],
  // 家庭
  family: [
    { en:'father', cn:'爸爸', pic:'👨' }, { en:'mother', cn:'妈妈', pic:'👩' },
    { en:'brother', cn:'哥哥', pic:'👦' }, { en:'sister', cn:'姐姐', pic:'👧' },
    { en:'grandpa', cn:'爷爷', pic:'👴' }, { en:'grandma', cn:'奶奶', pic:'👵' },
  ],
},

/* ================= 常识 / 科学 ================= */
common: {
  // 动物住哪里
  homes: [
    { animal:'🐟', home:'🌊', label:'水里' },
    { animal:'🐦', home:'🪹', label:'鸟窝' },
    { animal:'🐝', home:'🍯', label:'蜂巢' },
    { animal:'🐜', home:'🏔️', label:'蚁穴' },
    { animal:'🐻', home:'🕳️', label:'树洞' },
    { animal:'🐰', home:'🕳️', label:'洞穴' },
  ],
  // 吃什么
  foods: [
    { animal:'🐰', food:'🥕' }, { animal:'🐼', food:'🎋' },
    { animal:'🐵', food:'🍌' }, { animal:'🐭', food:'🧀' },
    { animal:'🐱', food:'🐟' }, { animal:'🐶', food:'🦴' },
    { animal:'🐮', food:'🌿' }, { animal:'🐔', food:'🌾' },
  ],
  // 影子配对
  shadows: [
    { item:'🌳', name:'树' }, { item:'🏠', name:'房子' },
    { item:'🚗', name:'汽车' }, { item:'☂️', name:'雨伞' },
    { item:'⭐', name:'星星' }, { item:'🐟', name:'鱼' },
  ],
  // 季节
  seasons: [
    { name:'春天', emoji:'🌸', feat:['花开','燕子回来','种树'] },
    { name:'夏天', emoji:'☀️', feat:['很热','游泳','吃西瓜'] },
    { name:'秋天', emoji:'🍂', feat:['落叶','收果实','天变凉'] },
    { name:'冬天', emoji:'❄️', feat:['下雪','穿棉袄','堆雪人'] },
  ],
  // 生活习惯（健康领域）
  habits: [
    { good:true,  icon:'🪥', text:'早晚刷牙' },
    { good:true,  icon:'🧼', text:'饭前洗手' },
    { good:true,  icon:'💤', text:'按时睡觉' },
    { good:true,  icon:'🥬', text:'多吃蔬菜' },
    { good:true,  icon:'🏃', text:'坚持运动' },
    { good:false, icon:'🍬', text:'吃很多糖' },
    { good:false, icon:'📺', text:'看很久电视' },
    { good:false, icon:'🥤', text:'喝很多汽水' },
  ],
  // 安全常识
  safety: [
    { icon:'🔥', text:'不玩火', safe:true },
    { icon:'🔌', text:'不摸插座', safe:true },
    { icon:'🚦', text:'红灯停绿灯行', safe:true },
    { icon:'🚗', text:'过马路牵大人手', safe:true },
    { icon:'🪟', text:'爬窗户', safe:false },
    { icon:'🔪', text:'玩刀具', safe:false },
    { icon:'💊', text:'乱吃药品', safe:false },
  ],
},

};
