# dsh-oneoffice · 插件市场上架指南

> 目标市场：**awesome-dsh-plugin.com**（内置 `dshmarket` 的目录源，由 `awesome-dsh-plugin/awesome-dsh-plugin` 组织维护，走 PR 收录）。
> 本文档从零到一，照着做即可，全部在 GitHub 网页上完成，无需本地命令。

## 0. 先决条件核对（当前状态）

| 条件 | 要求 | 我们当前 |
|---|---|---|
| 仓库年龄 | ≥ 1 天 | ✅ 2026-08-14 创建，已达标 |
| 提交数 | ≥ 10 | ✅ 已 10 个（刚刚补齐） |
| `dsh.bundle` manifest | `package.json` 声明 `dsh.bundle.patch` | ✅ 已有 |
| `cordis.patch.yml` | 仓库根存在 | ✅ 已有 |
| 真实可用代码 | 非占位/纯 README | ✅ 已实测装进桌面版生效 |
| `dsh-plugin` topic | 仓库要打这个 GitHub topic | ⚠️ **还没加（见步骤 1）** |
| 描述如实 | 一句话 en 描述，无营销词 | 见步骤 3 |

## 1. 给仓库添加 `dsh-plugin` topic（先做）

1. 打开 `https://github.com/MrWolfox-ctrlcv/dsh-oneoffice`
2. 右侧 **About** 面板 → 齿轮（⚙️ 编辑）→ **Topics** 输入框
3. 输入 `dsh-plugin` 回车添加
4. 保存

## 2. fork 市场仓库

1. 打开 `https://github.com/awesome-dsh-plugin/awesome-dsh-plugin`
2. 点右上 **Fork**（用你的账号）
3. 克隆到本地：`git clone https://github.com/<你的用户名>/awesome-dsh-plugin.git`

## 3. 创建收录条目 YAML

在 fork 出来的仓库里新建文件：

`data/plugins/MrWolfox-ctrlcv__dsh-oneoffice.yml`

```yaml
url: https://github.com/MrWolfox-ctrlcv/dsh-oneoffice
name: MrWolfox-ctrlcv/dsh-oneoffice
category: theme
description:
  en: One Monokai office-mode theme for DeepSeek Harness — a muted low-glare CSS overlay aligned with VS Code's One Monokai.
  zh: DeepSeek Harness 办公主题：One Monokai 质感，护眼舒适。
```

> 说明：
> - `category: theme` 很重要 —— 主题类会进 dshmarket 的**主题 Tab**（分类错了维护者会帮你改，不用担心）
> - `description.en` 必填（以句号结尾）；`zh` 可写可不写，不写维护者会补
> - **不要**在 yml 里写 `npm:` 字段 —— 收录后 npm 关联会自动从 registry 采集，手写会被校验拒绝
> - 描述必须如实、不带营销词

## 4. 本地生成 README（在 fork 仓库目录）

```sh
npm ci
node scripts/generate-readme.mjs
```

这会重新生成两份 README（README.md / README.en.md），把新条目刷进去。

## 5. 提交并推送

```sh
git add data/plugins/MrWolfox-ctrlcv__dsh-oneoffice.yml README.md README.en.md
git commit -m "Add MrWolfox-ctrlcv/dsh-oneoffice (theme)"
git push
```

> ⚠️ **只提交你自己的这条 + 重新生成的 README**，别动其他条目（CI 会检查 PR 是否改了无关条目）。

## 6. 提 PR

1. 打开你的 fork 仓库页 → 点 **Contribute → Open pull request**
2. 对比：`awesome-dsh-plugin:main` ← 你的分支
3. PR 描述里勾选模板要求（`pull_request_template.md`）：
   - [x] 已运行 `node scripts/generate-readme.mjs` 并提交重新生成的 README
   - [x] `package.json` 声明了 `dsh.bundle`（不只是 `dsh.client`）
   - [x] 仓库 ≥1 天且提交 ≥10
4. 提交 PR

## 7. 等 CI 与维护者评审

- CI（`pr-gate`）先自动校验：条目数（≤3）、`dsh.bundle`、仓库年龄/提交数、格式
- 绿了之后，维护者会**读我们的仓库源码**，核对描述是否属实
- 若被打回，按 PR 评论改对应行即可（通常是描述措辞），同分支推送修复
- 合并后网站自动重建，`plugins.json` 自动更新，桌面版 dshmarket 就能搜到

## 8. 发布 npm（可选，推荐，能显示下载量）

> 与收录无关，发不发都不影响收录；但发布后市场会显示下载量，且用户 npm 安装免 `allowBuilds` 授权。

1. `npm login`（浏览器完成登录）
2. 在 `dsh-oneoffice` 仓库目录执行 `npm publish`
3. 包名 `dsh-oneoffice` 已确认未被占用
4. 发布后**无需通知市场** —— `repository` 字段已指回我们仓库（`package.json` 里已配好），自动关联

## 9. 可选加分：截图

- 在 `data/screenshots.json` 里以 `https://github.com/MrWolfox-ctrlcv/dsh-oneoffice` 为 key，加 1-8 张 GitHub 托管的图片 URL
- 或直接用我们仓库 `screenshots/` 里的图（`https://raw.githubusercontent.com/MrWolfox-ctrlcv/dsh-oneoffice/main/screenshots/theme-dashboard.png` 等）
- 不加也行，市场会从 README 自动抽取图片

## 常见坑

- **只声明 `dsh.client` 会被拒** —— 我们已声明 `dsh.bundle` ✅
- **描述夸大被拒** —— 我们说的每句都能在代码里对上（CSS 覆盖 + client 注入 + iframe 覆盖）✅
- **PR 加了 >3 条** —— 我们就 1 条 ✅
- **改了别人的条目** —— 只动自己的文件 ✅