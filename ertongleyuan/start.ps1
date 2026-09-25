# 快乐学习乐园 · 本地启动脚本
# 用法：右键用 PowerShell 运行，或在终端执行 .\start.ps1
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8080

Write-Host ""
Write-Host "  🌈 快乐学习乐园 正在启动..." -ForegroundColor Cyan
Write-Host ""

# 优先用 Python 起静态服务器
$py = Get-Command python -ErrorAction SilentlyContinue
if($py){
    $ip = (Get-NetIPAddress -AddressFamily IPv4 |
           Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } |
           Select-Object -First 1).IPAddress
    Write-Host "  电脑访问:  http://localhost:$port" -ForegroundColor Green
    if($ip){ Write-Host "  手机访问:  http://${ip}:$port   (需同一 WiFi)" -ForegroundColor Green }
    Write-Host ""
    Write-Host "  按 Ctrl+C 停止服务" -ForegroundColor DarkGray
    Write-Host ""
    Start-Process "http://localhost:$port"
    Set-Location $root
    python -m http.server $port
} else {
    Write-Host "  未找到 Python，直接双击 index.html 也能打开。" -ForegroundColor Yellow
    Start-Process (Join-Path $root 'index.html')
}
