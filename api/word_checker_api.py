from http.server import BaseHTTPRequestHandler
import json
import re

# ==========================================
# 🛑 核心算法区：内置营销违禁词汇词库 (可随时自行扩充)
# ==========================================
BANNED_WORDS = [
    # 绝对化用语 (广告法违禁)
    "国家级", "世界级", "最高级", "第一", "唯一", "首个", "首选", "顶级", "绝版", "万能", "100%", "百分之百",
    # 夸大/虚假承诺 (引流高危)
    "包赚", "躺赚", "一夜暴富", "零风险", "稳赚不赔", "包治百病", "永久有效", "逢考必过",
    # 诱导引导类 (平台限流词)
    "加微信", "转账", "打款", "点击链接", "阅读原文", "扫码", "关注公众号"
]

# 编译正则表达式以提高匹配效率
BANNED_PATTERN = re.compile("|".join(map(re.escape, BANNED_WORDS)))

# ==========================================
# 📄 嵌入式网页前端 UI (极简操作台)
# ==========================================
HTML_PAGE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>营销文案违规词智能检测系统</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f0f2f5; color: #333; padding: 20px; }
        .container { max-width: 700px; margin: 40px auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        h1 { font-size: 22px; color: #1a1a1a; margin-bottom: 10px; text-align: center; }
        p.desc { font-size: 14px; color: #666; text-align: center; margin-bottom: 25px; }
        textarea { width: 100%; height: 180px; padding: 15px; border: 2px solid #e1e4e8; border-radius: 8px; font-size: 15px; outline: none; resize: vertical; transition: border 0.3s; box-sizing: border-box; }
        textarea:focus { border-color: #0366d6; }
        button { width: 100%; padding: 14px; background: #24292e; color: #fff; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 15px; transition: 0.2s; }
        button:hover { background: #0366d6; }
        .result-panel { margin-top: 25px; display: none; }
        .stat-box { display: flex; justify-content: space-between; background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #d73a49; }
        .stat-box.safe { border-left-color: #28a745; }
        .highlight { color: #d73a49; font-weight: bold; background: #ffeef0; padding: 2px 4px; border-radius: 3px; }
        .cleaned-text { background: #f6f8fa; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin-top: 10px;}
        h3 { font-size: 16px; margin-bottom: 10px; color: #24292e; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🛡️ 营销文案违规词智能检测系统</h1>
        <p class="desc">纯本地算法，数据零泄露。适用于平台发布前的文案自检脱敏</p>
        
        <textarea id="inputText" placeholder="请在此粘贴需要检测的文案内容..."></textarea>
        <button id="checkBtn" onclick="startCheck()">🚀 立即扫描检测</button>

        <div class="result-panel" id="resultPanel">
            <div class="stat-box" id="statBox">
                <span id="statusText">检测完成，发现违规词！</span>
                <span id="wordCount">风险词数量：0</span>
            </div>
            
            <h3>🔍 风险点标注：</h3>
            <div class="cleaned-text" id="markedText"></div>

            <h3 style="margin-top: 20px;">✅ 自动脱敏版本（可直接复制）：</h3>
            <div class="cleaned-text" id="safeText"></div>
        </div>
    </div>

    <script>
        async function startCheck() {
            const text = document.getElementById('inputText').value.trim();
            if (!text) { alert('请输入文案内容'); return; }

            const btn = document.getElementById('checkBtn');
            btn.innerText = '正在本地核对词库...';
            btn.disabled = true;

            try {
                const response = await fetch(window.location.href, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: text })
                });

                const data = await response.json();
                
                document.getElementById('resultPanel').style.display = 'block';
                const statBox = document.getElementById('statBox');
                
                if (data.violation_count > 0) {
                    statBox.className = 'stat-box';
                    document.getElementById('statusText').innerHTML = '⚠️ <b>检测完毕，发现高危营销词汇！</b>';
                    document.getElementById('wordCount').innerText = `风险命中：${data.violation_count} 处`;
                } else {
                    statBox.className = 'stat-box safe';
                    document.getElementById('statusText').innerHTML = '✅ <b>恭喜，当前文案非常安全！</b>';
                    document.getElementById('wordCount').innerText = '未命中违禁词库';
                }

                document.getElementById('markedText').innerHTML = data.marked_content;
                document.getElementById('safeText').innerText = data.safe_content;

            } catch (err) {
                alert('系统异常，请检查控制台。');
            } finally {
                btn.innerText = '🚀 立即扫描检测';
                btn.disabled = false;
            }
        }
    </script>
</body>
</html>
"""

# ==========================================
# 🐍 Python 服务端核心逻辑 (无外部请求，纯本地处理)
# ==========================================
class handler(BaseHTTPRequestHandler):

    def do_GET(self):
        """浏览器直接访问时，返回可视化操作台"""
        self.send_response(200)
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(HTML_PAGE.encode('utf-8'))

    def do_POST(self):
        """API 调用时，执行纯算法分析"""
        try:
            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            # 解析提交的内容
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            req_data = json.loads(post_data.decode('utf-8'))
            
            original_text = req_data.get('content', '')

            # 1. 计算违规次数
            violations = BANNED_PATTERN.findall(original_text)
            violation_count = len(violations)

            # 2. 生成高亮标记版本 (给前端展示用，将敏感词包上 HTML 标签)
            def highlight_match(match):
                word = match.group(0)
                return f'<span class="highlight">{word}</span>'
            
            marked_text = BANNED_PATTERN.sub(highlight_match, original_text)

            # 3. 生成安全脱敏版本 (将敏感词替换为 ***)
            safe_text = BANNED_PATTERN.sub('***', original_text)

            # 打包返回结果
            response = {
                "status": "success",
                "violation_count": violation_count,
                "found_words": list(set(violations)),
                "marked_content": marked_text.replace('\n', '<br>'), # 处理换行符
                "safe_content": safe_text
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))

        except Exception as e:
            error_response = {"status": "error", "message": str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

# ==========================================
# 🚀 本地启动引擎
# ==========================================
if __name__ == '__main__':
    from http.server import HTTPServer
    port = 8000
    print(f"✅ 违禁词检测系统启动成功！")
    print(f"👉 请在浏览器访问: http://localhost:{port}")
    HTTPServer(('', port), handler).serve_forever()