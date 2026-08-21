# dsh-oneoffice · One Monokai (Office Mode)

An **One Monokai office-mode** theme pack for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web UI. It is an independent CSS override layer — it never touches dsh source, and deploys/uninstalls with one script.

> Goal: bring dsh's web UI back from a "flashy tech display" to a plain, comfortable office look, reducing eye strain during long sessions.

## ✨ Features

- **Closely aligned with VS Code's One Monokai**: muted primary text, desaturated link blue, backgrounds aligned to the `#282c34` family
- **Independent override layer**: injects a single `<link>`, no dsh source changes — re-run the script after a dsh upgrade to restore the theme
- **One-click deploy / uninstall**: auto-locates the repo, injects the theme, restarts dsh

## 📦 Files

| File | Purpose |
|---|---|
| `one-monokai-office.css` | Theme body (independent CSS override layer) |
| `deploy.ps1` | One-click deploy / uninstall script |
| `make-font-size.ps1` | Base font-size scaling (default 14px) |
| `font-size.css` | Generated font-size override |
| `README.en.md` | This English README |
| `LICENSE` | MIT license (includes original theme copyright) |

## � Install as a dsh plugin (recommended, market-ready)

This repo is also a standard **dsh theme plugin** — installable from the plugin market (in-app `dshmarket` / [awesome-dsh-plugin.com](https://awesome-dsh-plugin.com)) or the CLI:

```bash
# CLI (needs dsh CLI)
dsh plugin --profile web add github:MrWolfox-ctrlcv/dsh-oneoffice

# or from npm once published
dsh plugin --profile web add dsh-oneoffice
```

After installing, toggle it in **Settings → General → One Monokai office theme**. When on it injects the full overlay; when off it removes it entirely — no source changes.

> **Strong-compat iframe theming**: some plugins (e.g. `dsh-synapse` map) render in nested same-origin iframes that a parent `<style>` cannot reach. While enabled, the theme automatically injects a matching overlay into those iframes too, unifying buttons / sidebar / inputs / cards / view-switches onto the One Monokai dark palette. Disabling or uninstalling removes it cleanly.

## �🚀 Quick Start

```powershell
# Deploy (auto-locate repo + restart dsh)
powershell -ExecutionPolicy Bypass -File deploy.ps1

# Specify repo path
powershell -ExecutionPolicy Bypass -File deploy.ps1 -Repo "D:\path\to\deepseek-harness"

# Uninstall / restore
powershell -ExecutionPolicy Bypass -File deploy.ps1 -Uninstall

# Deploy without restart (takes effect next time dsh starts)
powershell -ExecutionPolicy Bypass -File deploy.ps1 -NoRestart
```

After deploying, refresh `http://127.0.0.1:3080` to see the theme.

> `deploy.ps1` is fully self-contained and does **not** depend on any management console. It locates the repo, copies the CSS, injects the `<link>`, and restarts dsh on its own.

## 🎨 Design Highlights

| Visual issue | Before | After (office mode) |
|---|---|---|
| Primary text too bright (glow) | `#d7dae0` (luminance 0.85) | `#D4D4D4` (muted, VS Code-like) |
| Link/accent blue too vivid | High-saturation blue | `#61afef` (One Monokai link blue) |
| Background | Bluish gray | `#21252b` chat / `#282c34` sidebar |
| Code blocks | Dark solid | Light gray `rgba(220,220,220,0.1)` + golden `#e5c07b` text |
| Code font | — | Consolas (editor-like) |
| UI font | — | Segoe UI + Microsoft YaHei (Copilot Chat-like) |
| Glowing gradient text | On | Suppressed |
| Link style | Blue link | File chips: light box + normal text (Copilot Chat-like) |

## 🌍 Publishing (GitHub)

This pack is best distributed as a **GitHub repository** rather than an npm package — it ships CSS + PowerShell scripts, not a JS library, and integrates with dsh's local `apps/web/dist` deployment model.

1. Create a repo (e.g. `dsh-one-monokai-theme`)
2. Push all files in this directory
3. Keep the inspiration note at the top of this README and the original copyright line in `LICENSE` (MIT requirement)
4. Tag a release and attach a zip for one-click download

## 📜 License & Credits

- Color inspiration: **[One Monokai](https://github.com/azemoh/vscode-one-monokai)** (by Joshua Azemoh, MIT License)
- This project is MIT licensed — see `LICENSE`
- This theme is an independent implementation, not an official product
