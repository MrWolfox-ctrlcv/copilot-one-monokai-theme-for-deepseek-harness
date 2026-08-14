# ============================================================
#  dsh-theme — 字号缩放生成脚本
#  ------------------------------------------------------------
#  读取 font-size.conf 里的基准字号, 按比例缩放 dsh 所有字号
#  token, 生成 font-size.css 覆盖层。
#
#  用法:  powershell -ExecutionPolicy Bypass -File make-font-size.ps1 [基准字号]
#         (不传参则读取 font-size.conf, 无则用 14)
#
#  基准字号 = markdown 正文(dsw-font-markdown-base)的目标值。
#  其余档位(标题/小字/代码)按 dsh 原比例等比缩放, 贴近 VS Code
#  "单一基准字号"的体验。
# ============================================================

param([string]$BaseSize = '')

$ErrorActionPreference = 'Stop'
$Dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Conf = Join-Path $Dir 'font-size.conf'

# ---------- 解析基准字号 ----------
if (-not $BaseSize) {
    if (Test-Path $Conf) {
        $v = (Get-Content $Conf -Raw).Trim()
        if ($v -match '^\d+(\.\d+)?$') { $BaseSize = $v }
    }
}
if (-not $BaseSize) { $BaseSize = '14' }
$base = [double]$BaseSize
if ($base -lt 8 -or $base -gt 24) { Write-Host '[错误] 基准字号需在 8-24 之间'; exit 1 }

# ---------- dsh 原始档位: token名 -> (原字号, 原行高) ----------
# 以 markdown-base=16 为 1.0 基准的比例
$scale = @{
    'markdown-h1'             = @(24, 34)
    'markdown-h2'             = @(22, 32)
    'markdown-h3'             = @(20, 30)
    'markdown-h4'             = @(16, 28)
    'markdown-base'           = @(16, 28)
    'markdown-base-strong'    = @(16, 28)
    'markdown-base-italic'    = @(16, 28)
    'markdown-base-strong-italic' = @(16, 28)
    'markdown-table'          = @(15, 25)
    'markdown-table-head'     = @(15, 25)
    'markdown-small'          = @(14, 24)
    'markdown-small-strong'   = @(14, 24)
    'markdown-small-italic'   = @(14, 24)
    'markdown-small-strong-italic' = @(14, 24)
    'markdown-code'           = @(14, 22)
    'markdown-code-block'     = @(13, 22)
    'markdown-code-block-small' = @(12, 18)
    'xl-24'                   = @(24, 32)
    'l-20'                    = @(20, 28)
    'm-18'                    = @(16, 28)
    'base-16'                 = @(16, 24)
    'base-strong-16'          = @(16, 24)
    's-14'                    = @(14, 22)
    's-strong-14'             = @(14, 22)
    'xs-13'                   = @(13, 20)
    'xs-strong-13'            = @(13, 20)
    'xxs-12'                  = @(12, 18)
    'xxs-strong-12'           = @(12, 18)
    'xxxs-11'                 = @(11, 14)
    'xxxs-strong-11'          = @(11, 14)
}

# ---------- 计算缩放并生成 CSS ----------
# 比例 = 目标基准 / 原 markdown-base(16)
$ratio = $base / 16.0

$lines = @(
    '/* ============================================================',
    ' *  dsh-theme — 字号覆盖层 (自动生成, 勿手改)',
    " *  基准字号: ${base}px (markdown 正文)  生成时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm')",
    ' * ============================================================ */',
    'body {'
)
foreach ($key in $scale.Keys | Sort-Object) {
    $orig = $scale[$key]
    $newSize = [Math]::Round($orig[0] * $ratio, 1)
    $newLh   = [Math]::Round($orig[1] * $ratio, 1)
    $lines += "  --dsw-font-${key}-font-size: ${newSize}px;"
    $lines += "  --dsw-font-${key}-line-height: ${newLh}px;"
    # 完整简写 token 里也带 size/lh, 需要同步 (weight 与 family 保持不变)
    $lines += "  --dsw-font-${key}: var(--dsw-font-${key}-font-weight) ${newSize}px/${newLh}px var(--dsw-font-${key}-font-family);"
}
$lines += '}'

# ---------- 写出 ----------
$out = Join-Path $Dir 'font-size.css'
Set-Content $out ($lines -join "`r`n") -Encoding UTF8

# 保存配置
Set-Content $Conf "$base" -Encoding UTF8
Write-Host "[OK] 已生成 $out (基准 ${base}px)"
Write-Host "     正文 ${base}px | 小字 $([Math]::Round(14*$ratio,1))px | 代码 $([Math]::Round(13*$ratio,1))px | h1 $([Math]::Round(24*$ratio,1))px"
