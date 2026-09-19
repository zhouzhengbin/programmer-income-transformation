# -*- coding: utf-8 -*-
import io, os, re
D = r"C:\Users\86139\Documents\ChatGPT\小二算数"
c = io.open(os.path.join(D,"index-standalone.html"), encoding="utf-8").read()
print("总长:", len(c))

print("\n=== 换一题 出现位置 ===")
for m in re.finditer("换一题", c):
    i = m.start()
    print("--- @%d ---" % i)
    print(c[max(0,i-500):i+700])
    print()

print("\n=== reroll / nextBtn / regen 函数名 ===")
for m in re.finditer(r"(?:function|const|let|var)\s+(\w*(?:reroll|next|regen|refresh|newQ|swap)\w*)", c, re.I):
    print("  ", m.group(1))
