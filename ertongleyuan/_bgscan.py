s=open("js/bg.js",encoding="utf-8").read()
import re
# 找出所有 globalAlpha 和 fillStyle 设置
for m in re.finditer(r"globalAlpha\s*=\s*([^;]+)", s):
    print("alpha:", m.group(1).strip())
print("---fillStyle---")
for m in re.finditer(r"fillStyle\s*=\s*([^;]+)", s):
    print(m.group(1).strip()[:60])
