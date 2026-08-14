# ============================================================
#  dsh-theme — One Monokai Office Mode 一键部署脚本
#  ------------------------------------------------------------
#  用法:
#   部署:   powershell -ExecutionPolicy Bypass -File deploy.ps1
#           powershell -ExecutionPolicy Bypass -File deploy.ps1 -Repo "D:\path\to\deepseek-harness"
#   卸载:   powershell -ExecutionPolicy Bypass -File deploy.ps1 -Uninstall
#           powershell -ExecutionPolicy Bypass -File deploy.ps1 -Uninstall -Repo "D:\path\to\deepseek-harness"
#
#  参数:
#   -Repo        dsh 仓库根目录 (含 apps/web)。默认自动探测。
#   -Uninstall   卸载主题并还原默认
#   -NoRestart   部署/卸载后不自动重启 dsh (默认会自动重启)
# ============================================================

param(
    [string]$Repo = '',
    [switch]$Uninstall,
    [switch]$NoRestart
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ---------- 定位路径 ----------
$ThemeDir    = Split-Path -Parent $MyInvocation.MyCommand.Path
$ThemeFile   = Join-Path $ThemeDir 'one-monokai-office.css'
$FontSizeFile = Join-Path $ThemeDir 'font-size.css'
$ThemeRel    = 'assets/themes/one-monokai-office.css'
$FontSizeRel = 'assets/themes/font-size.css'
$MarkerRel   = 'assets/themes/.dsh-theme-installed'
$LinkHref    = '/assets/themes/one-monokai-office.css'
$LinkMark    = 'data-dsh-theme="one-monokai-office"'
$FontLinkHref = '/assets/themes/font-size.css'
$FontLinkMark = 'data-dsh-fontsize="active"'

if (-not $Repo) {
    # 自动探测: 1) 当前目录  2) 上级目录  3) 常见路径
    $candidates = @(
        (Get-Location).Path,
        (Split-Path -Parent (Get-Location).Path),
        "$env:USERPROFILE\Wrk\dsh\deepseek-harness",
        "C:\Users\yaosh\Wrk\dsh\deepseek-harness"
    )
    foreach ($c in $candidates) {
        if (Test-Path (Join-Path $c 'apps\web\dist\index.html')) {
            $Repo = $c; break
        }
    }
}
if (-not $Repo) {
    Write-Host '[错误] 未找到 dsh 仓库, 请用 -Repo 指定路径' -ForegroundColor Red
    exit 1
}
$Dist = Join-Path $Repo 'apps\web\dist'
$Index = Join-Path $Dist 'index.html'
if (-not (Test-Path $Index)) {
    Write-Host "[错误] 未找到 Web UI 产物: $Index" -ForegroundColor Red
    Write-Host '       请先构建 dsh (pnpm run build) 或确认 -Repo 路径正确'
    exit 1
}

function Test-DshRunning {
    # 检查 dsh Web UI 端口是否在监听
    $c = New-Object Net.Sockets.TcpClient
    try {
        $c.Connect('127.0.0.1', 3080); $c.Close(); return $true
    } catch { return $false } finally { $c.Dispose() }
}

function Restart-Dsh {
    # 复用 dsh-manager 的重启逻辑 (读取 pid 文件 -> taskkill -> 重启)
    $managerDir = Join-Path $env:USERPROFILE '.dsh-manager'
    $pidFile    = Join-Path $managerDir 'dsh.pid'
    $logOut     = Join-Path $managerDir 'dsh.out.log'
    $logErr     = Join-Path $managerDir 'dsh.err.log'
    $oldPid     = $null
    if (Test-Path $pidFile) {
        $v = (Get-Content $pidFile -Raw).Trim()
        if ($v -match '^\d+$') { $oldPid = [int]$v }
    }
    if (Test-Path $pidFile) { Remove-Item $pidFile -ErrorAction SilentlyContinue }

    # 从旧命令行还原启动参数 (trusted-host 等)
    $trustedArgs = ''
    if ($oldPid) {
        $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$oldPid" -ErrorAction SilentlyContinue
        if ($proc -and $proc.CommandLine -match 'dsh web(.*)$') {
            $rest = $matches[1].Trim()
            # 只保留 --trusted-host 参数, 丢弃多余空白
            $trusted = ([regex]::Matches($rest, '--trusted-host\s+\S+') | ForEach-Object { $_.Value }) -join ' '
            $trustedArgs = " $trusted"
        }
        Write-Host "正在停止旧进程 (PID=$oldPid)..."
        taskkill /PID $oldPid /T /F 2>&1 | Out-Null
        Start-Sleep -Milliseconds 800
    }

    $work = $Repo
    $cmd  = "npx --yes pnpm@11.7.0 dsh web$trustedArgs"
    Write-Host "正在启动: $cmd"
    $proc = Start-Process -FilePath 'cmd.exe' `
        -ArgumentList '/c', $cmd `
        -WorkingDirectory $work `
        -RedirectStandardOutput $logOut `
        -RedirectStandardError  $logErr `
        -PassThru -WindowStyle Hidden
    $proc.Id | Set-Content $pidFile
    Write-Host "已启动, PID=$($proc.Id), 等待 Web UI 就绪..."

    for ($i = 0; $i -lt 120; $i++) {
        if (Test-DshRunning) { Write-Host "Web UI 就绪: http://127.0.0.1:3080"; return }
        if (-not (Get-Process -Id $proc.Id -ErrorAction SilentlyContinue)) {
            Write-Host '[错误] 进程已退出, 请查看 dsh.err.log' -ForegroundColor Red; return
        }
        Start-Sleep -Seconds 1
    }
    Write-Host '[提示] 等待超时, 请检查日志' -ForegroundColor Yellow
}

# ---------- 部署 ----------
if (-not $Uninstall) {
    if (-not (Test-Path $ThemeFile)) {
        Write-Host "[错误] 找不到主题文件: $ThemeFile" -ForegroundColor Red
        exit 1
    }

    # 1) 复制主题 CSS 到 dist/assets/themes/
    $destDir = Join-Path $Dist 'assets\themes'
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    Copy-Item $ThemeFile (Join-Path $Dist $ThemeRel) -Force

    # 2) 若有字号文件, 一并复制并注入
    $hasFont = Test-Path $FontSizeFile
    if ($hasFont) {
        Copy-Item $FontSizeFile (Join-Path $Dist $FontSizeRel) -Force
        $base = (Get-Content (Join-Path $ThemeDir 'font-size.conf') -Raw -ErrorAction SilentlyContinue).Trim()
        Write-Host "[OK] 发现字号覆盖 (基准 ${base}px)"
    }

    # 3) 在 index.html 的 </head> 前注入 link (若已存在则跳过)
    $html = Get-Content $Index -Raw -Encoding UTF8
    $linkTag = "<link rel=`"stylesheet`" href=`"$LinkHref`" $LinkMark>"
    if ($html -match [regex]::Escape($LinkMark)) {
        Write-Host '[提示] 主题已注入, 跳过 link 注入'
    } else {
        if ($html -notmatch '</head>') {
            Write-Host '[错误] index.html 缺少 </head>, 无法注入' -ForegroundColor Red
            exit 1
        }
        $html = $html -replace '</head>', "$linkTag`r`n</head>"
        Set-Content $Index $html -Encoding UTF8
        Write-Host '[OK] 已注入主题 link 到 index.html'
    }

    # 4) 若有字号文件, 注入字号 link (放在主题 link 之后, 保证覆盖顺序正确)
    if ($hasFont) {
        $fontTag = "<link rel=`"stylesheet`" href=`"$FontLinkHref`" $FontLinkMark>"
        if ($html -match [regex]::Escape($FontLinkMark)) {
            Write-Host '[提示] 字号 link 已存在, 跳过'
        } else {
            $html = Get-Content $Index -Raw -Encoding UTF8
            if ($html -notmatch '</head>') {
                Write-Host '[错误] index.html 缺少 </head>, 无法注入字号' -ForegroundColor Red
                exit 1
            }
            $html = $html -replace '</head>', "$fontTag`r`n</head>"
            Set-Content $Index $html -Encoding UTF8
            Write-Host '[OK] 已注入字号 link 到 index.html'
        }
    }

    # 5) 写入安装标记
    Set-Content (Join-Path $DestDir '.dsh-theme-installed') 'one-monokai-office' -Encoding UTF8

    Write-Host "[OK] One Monokai Office 主题已部署"
    Write-Host "     主题文件: $ThemeRel"
    if ($hasFont) { Write-Host "     字号文件: $FontSizeRel" }
    if (-not $NoRestart) { Restart-Dsh }
    else { Write-Host '[提示] 已跳过重启。dsh 下次启动时生效。' }

# ---------- 卸载 ----------
} else {
    $destDir = Join-Path $Dist 'assets\themes'
    $changed = $false

    # 1) 移除 index.html 中的 link (主题 + 字号)
    if (Test-Path $Index) {
        $html = Get-Content $Index -Raw -Encoding UTF8
        foreach ($mark in @($LinkMark, $FontLinkMark)) {
            if ($html -match [regex]::Escape($mark)) {
                $pattern = '<link[^>]*' + [regex]::Escape($mark) + '[^>]*>\s*'
                $html = $html -replace $pattern, ''
                Write-Host "[OK] 已从 index.html 移除 link ($mark)"
                $changed = $true
            }
        }
        Set-Content $Index $html -Encoding UTF8
        if (-not ($html -match [regex]::Escape($LinkMark) -or $html -match [regex]::Escape($FontLinkMark))) {
            # 无残留时才无需再次写入, 上面 Set-Content 已保存
        }
    }

    # 2) 删除主题/字号文件与标记
    foreach ($f in @($ThemeRel, $FontSizeRel, $MarkerRel)) {
        $full = Join-Path $Dist $f
        if (Test-Path $full) { Remove-Item $full -Force; Write-Host "[OK] 已删除 $f"; $changed = $true }
    }
    if (Test-Path (Join-Path $DestDir '.dsh-theme-installed')) { Remove-Item (Join-Path $DestDir '.dsh-theme-installed') -Force }

    if (-not $changed) { Write-Host '[提示] 未发现主题痕迹, 已是默认状态' }
    else {
        Write-Host '[OK] 已卸载 One Monokai Office 主题'
        if (-not $NoRestart) { Restart-Dsh }
        else { Write-Host '[提示] 已跳过重启。dsh 下次启动时生效。' }
    }
}
