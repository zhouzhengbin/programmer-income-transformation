s = open("js/bg.js", encoding="utf-8").read()
# 减少云和漂浮元素数量
s = s.replace("layers.push({ type:'cloud', items: mkClouds(5) });", "layers.push({ type:'cloud', items: mkClouds(3) });")
s = s.replace("layers.push({ type:'float', items: mkFloats(18) });", "layers.push({ type:'float', items: mkFloats(11) });")
# 降低云的不透明度相关值（把 0.30 改为 0.20，如果存在）
s = s.replace("globalAlpha = 0.30", "globalAlpha = 0.20")
open("js/bg.js", "w", encoding="utf-8").write(s)
print("云:", "mkClouds(3)" in s, "| 漂浮:", "mkFloats(11)" in s)
