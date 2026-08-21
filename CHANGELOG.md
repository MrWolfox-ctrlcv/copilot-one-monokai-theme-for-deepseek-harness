# Changelog

## [1.0.0] — 2026-08-21

首个发布：以标准 dsh 主题插件形式发布。

### Added
- 打包为标准 dsh 主题插件（`dsh.bundle.patch` + `dsh.client.inject`），可从插件市场 / `dsh plugin add` 一键安装
- 设置页「设置 → 通用 → One Monokai 办公主题」开关，localStorage 持久化，开/关即时生效、可逆
- 强兼容嵌套 iframe 面板（dsh-synapse 会话地图）：自动注入配套深色覆盖，按钮 / 侧边栏 / 输入 / 卡片统一 One Monokai 色板
- `preview.html` 市场上架预览页
- 会话地图/对话切换浮层适配：深色胶囊 + 半透明白选中态（与右侧 Explorer 激活标签一致）
- 构建脚本 `scripts/build.mjs`：从 `one-monokai-office.css` 单源生成 `client.js`

### Notes
- 主题为纯 CSS 覆盖层，不修改 dsh 源码；升级 dsh 后重新安装/构建即可
- 配色参考 One Monokai（azemoh.vscode-one-monokai，MIT）+ VS Code 深色布局 + dsh 原生设计 token