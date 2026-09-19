# -*- coding: utf-8 -*-
import io, os, re
D = r"C:\Users\86139\Documents\ChatGPT\小二算数"
c = io.open(os.path.join(D,"js","app.js"), encoding="utf-8").read()

print("=== app.js 中换一题相关代码 ===")
for m in re.finditer(r".{200}换一题.{400}", c, re.S):
    print(m.group(0))
    print("---")

print()
print("=== 查找 next / reroll / refresh 函数 ===")
for m in re.finditer(r"function\s+(\w*(?:next|reroll|refresh|newQ|swap|change)\w*)\s*\(", c, re.I):
    print("  ", m.group(1))

print()
print("=== 查找 .build / build() 调用点 ===")
for m in re.finditer(r".{120}\.build\s*\(.{200}", c, re.S):
    print(m.group(0)[:300])
    print("---")
