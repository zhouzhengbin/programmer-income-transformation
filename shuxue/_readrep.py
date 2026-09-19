# -*- coding: utf-8 -*-
import io, json, os
D = r"C:\Users\86139\Documents\ChatGPT\小二算数"
r = json.load(io.open(os.path.join(D,"_verify2.json"),encoding="utf-8"))
for line in r["steps"]:
    if any(k in line for k in ["逐课","换题","题库","不同题目","qKey","qLen","genKeys","错误","可见按钮"]):
        print(line)
print()
print("=== 错误 ===")
print("  总数:", len(r["errs"]))
for e in r["errs"][:10]: print("   ", e[:150])
