/* copilot-one-monokai-office — client bundle template.
 *
 * This file is NOT served directly. scripts/build.mjs replaces the two
 * placeholder tokens (the package id and the inlined theme CSS) and writes
 * the final self-contained bundle to client.js — the exact artifact format
 * the official packages emit (tsdown), which the shell kernel loads via
 * window.__ModuleLoader__.load({ id, factory }).
 *
 * The factory body resolves the shared client-runtime modules the same way
 * the official ui-theme package does (react/jsx-runtime for JSX) then:
 *   - injects the full One Monokai office-mode overlay as a <style> block
 *     while enabled (the CSS is self-contained: it overrides every --dsw-* /
 *     --shiki-* token plus the element-level rules needed for the VS Code
 *     One Monokai look),
 *   - persists the on/off flag in localStorage (self-contained; a dsh-settings
 *     namespace would not be exposed to the Web client — see lib/index.js),
 *   - registers a settings row (on/off) into the General settings item slot.
 */
window.__ModuleLoader__.load({
	id: "copilot-one-monokai-office",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		let react_jsx_runtime = require("react/jsx-runtime");
		let primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let runtime_client = require("@deepseek-ai/dsh-client-runtime/client");

		const { jsx, jsxs } = react_jsx_runtime;
		const { Pill } = primitives;
		const { defineStore } = runtime_client;

		/** Source id of this overlay (the package id the façade pins). */
		const SOURCE = "copilot-one-monokai-office";

		/** Full One Monokai office-mode overlay, inlined at build time. */
		const THEME_CSS = "/* ============================================================\r\n *  dsh — One Monokai Office Mode（办公模式）\r\n * ------------------------------------------------------------\r\n *  独立的主题覆盖层：不改动 dsh 源码，只覆盖 dsh 的 --dsw-* /\r\n *  --shiki-* token，让 Web UI 全面向 VS Code 的 One Monokai\r\n *  主题（azemoh.one-monokai）的质朴舒适看齐。\r\n *\r\n *  安装方式：见 deploy.ps1（一键部署 / 卸载）。\r\n *\r\n *  配色灵感来源：\r\n *    VS Code \"One Monokai\" 主题\r\n *    https://github.com/azemoh/vscode-one-monokai （MIT License）\r\n *\r\n *  关键设计原则（针对\"炫彩/发光\"问题的修正）：\r\n *   - 主文字降哑：#d7dae0(0.85亮度) → #abb2bf(0.57亮度)，与 VS Code 正文一致\r\n *   - 链接/强调蓝降饱和：#6a9bff → #61afef（One Monokai 链接蓝，不发荧光）\r\n *   - 背景严格对齐 VS Code：#282c34 编辑器 / #21252B 面板\r\n *   - 交互 hover 更克制，回归\"纸质文稿\"质感\r\n * ============================================================ */\r\n\r\nbody[data-ds-dark-theme] {\r\n  /* ---------- 背景层级（反色：对话界面深 / 侧边栏浅） ---------- */\r\n  /* 对话界面 = 原侧边栏深色 #21252b，让阅读区更沉静护眼 */\r\n  --dsw-alias-bg-base: #21252b;                /* 对话界面(主内容)背景 */\r\n  --dsw-alias-bg-layer-1: #262a32;             /* 浮层底层 */\r\n  --dsw-alias-bg-layer-2: #282c34;             /* 浮层中层 */\r\n  --dsw-alias-bg-layer-3: #2c313a;             /* 面板 / 页签 */\r\n  --dsw-alias-bg-module-platform: #262a32;     /* 模块平台 */\r\n  --dsw-alias-bg-overlay: #1d1f23;             /* 下拉 / 弹层 */\r\n  --dsw-alias-bg-mask-drop: rgba(33, 37, 43, 0.7);\r\n  --dsw-alias-bg-multi-select: #262a32;\r\n  --dsw-alias-bg-skeleton: rgba(255, 255, 255, 0.04);\r\n\r\n  /* 侧边栏 = 原对话界面浅色 #282c34，作视觉分离 */\r\n  --dsw-specific-sidebar-fill: #282c34;        /* 侧边栏(浅) = 原编辑器背景 */\r\n  --dsw-specific-sidebar-nav-item-active: #262a32;\r\n  --dsw-specific-sidebar-nav-item-hover: #24282f;\r\n  --dsw-specific-sidebar-nav-item-active-accent: #262a32;\r\n  --dsw-specific-menu: #21252b;\r\n  --dsw-specific-selector: #21252b;\r\n  --dsw-specific-input-major: #1d1f23;         /* input.background */\r\n  --dsw-specific-login-input: #1d1f23;\r\n  --dsw-specific-tip: #262a32;\r\n  --dsw-specific-bubble: #262a32;\r\n  --dsw-specific-bubble-highlight: #2c313a;\r\n\r\n  /* ---------- 文字层级（核心：主文字降哑 + One Monokai 米白） ---------- */\r\n  --dsw-alias-label-primary: #D4D4D4;          /* 正文 = One Monokai 实际正文(米白, VS Code 深色默认) */\r\n  --dsw-alias-label-primary-bluish: #D4D4D4;   /* 高亮标题 */\r\n  --dsw-alias-label-primary-inverted: #282c34;\r\n  --dsw-alias-label-primary-dimmed: #5c6370;   /* 注释级 */\r\n  --dsw-alias-label-secondary: #9da5b4;        /* statusBar.foreground */\r\n  --dsw-alias-label-tertiary: #7f848e;         /* 三级文字 */\r\n  --dsw-alias-label-caption: #6b7280;          /* 说明文字 */\r\n  --dsw-alias-label-dimmed: #5c6370;           /* 弱化 = comment */\r\n\r\n  /* ---------- 品牌 / 强调（降饱和，不发荧光） ---------- */\r\n  --dsw-alias-brand-primary: #D4D4D4;\r\n  --dsw-alias-brand-primary-invert: #282c34;\r\n  --dsw-alias-brand-text: #D4D4D4;\r\n  --dsw-alias-brand-primary-new-colorprimary-new-color: #528bff; /* button.background */\r\n  --dsw-alias-state-business-primary: #61afef; /* 链接蓝 = entity.name.class */\r\n  --dsw-alias-state-business-tertiary: #2c313a;\r\n  --dsw-alias-button-info-fill: #528bff;       /* 主按钮 */\r\n  --dsw-alias-button-info-hover: #61afef;\r\n  --dsw-alias-button-primary-fill: #528bff;\r\n  --dsw-alias-button-primary-hover: #61afef;\r\n  --dsw-alias-button-primary-dimmed: #2c313a;\r\n  --dsw-alias-button-contrast-fill: #abb2bf;\r\n  --dsw-alias-button-elevated-fill: #21252b;\r\n  --dsw-alias-button-floating-fill: #21252b;\r\n  --dsw-alias-button-floating-hover: #262a32;\r\n  --dsw-alias-button-ghost-active-border: #5c6370;\r\n  --dsw-alias-button-ghost-active-fill: #262a32;\r\n  --dsw-alias-button-ghost-active-hover: #2c313a;\r\n  --dsw-alias-button-tool-bar-fill: rgba(84, 85, 87, 0.4);\r\n  --dsw-alias-button-tool-bar-hover: rgba(84, 85, 87, 0.55);\r\n\r\n  /* ---------- 交互 hover（更克制） ---------- */\r\n  --dsw-alias-interactive-bg-hover: rgba(255, 255, 255, 0.05);\r\n  --dsw-alias-interactive-bg-active: rgba(255, 255, 255, 0.08);\r\n  --dsw-alias-interactive-bg-hover-solid: #262a32;\r\n  --dsw-alias-interactive-bg-hover-accent: rgba(255, 255, 255, 0.1);\r\n  --dsw-alias-interactive-bg-hover-danger: rgba(224, 108, 117, 0.12);\r\n\r\n  /* ---------- 边框（弱化） ---------- */\r\n  --dsw-alias-border-l1: rgba(255, 255, 255, 0.04);\r\n  --dsw-alias-border-l2: rgba(255, 255, 255, 0.08);\r\n  --dsw-alias-border-l2-darkmode-thin: rgba(255, 255, 255, 0.05);\r\n  --dsw-alias-border-l3: rgba(255, 255, 255, 0.12);\r\n  --dsw-alias-border-l4: rgba(255, 255, 255, 0.16);\r\n\r\n  /* ---------- 状态色（One Monokai 柔和版） ---------- */\r\n  --dsw-alias-state-success-primary: #98c379;  /* lime */\r\n  --dsw-alias-state-success-secondary: #7ba55f;\r\n  --dsw-alias-state-success-tertiary: #2c3a2a;\r\n  --dsw-alias-state-error-primary: #e06c75;    /* pink/red */\r\n  --dsw-alias-state-error-secondary: #c24038;\r\n  --dsw-alias-state-warn-primary: #e5c07b;     /* gold */\r\n  --dsw-alias-state-warn-secondary: #d19a66;\r\n  --dsw-alias-state-warn-label: #d19a66;\r\n  --dsw-alias-state-warn-tertiary: #3a352a;\r\n\r\n  /* ---------- 滚动条（One Monokai 灰） ---------- */\r\n  --dsw-alias-scrollbar-bg-l1: #4e5666;\r\n  --dsw-alias-scrollbar-bg-l2: #4e5666;\r\n  --dsw-alias-scrollbar-hover-l1: #5a6375;\r\n  --dsw-alias-scrollbar-hover-l2: #5a6375;\r\n\r\n  /* ---------- 代码块 / 内联代码（对标 VS Code: 淡灰底 + 金黄字） ---------- */\r\n  /* VS Code textCodeBlock.background = rgba(220,220,220,0.1) 淡灰 */\r\n  --dsw-alias-markdown-code-block: rgba(220, 220, 220, 0.1);\r\n  --dsw-alias-markdown-code-block-banner: rgba(220, 220, 220, 0.1);\r\n  --dsw-alias-markdown-inline-code: rgba(220, 220, 220, 0.12);\r\n  --dsw-alias-markdown-citation: #262a32;\r\n  --dsw-alias-markdown-placeholder: #5c6370;\r\n  --dsw-alias-markdown-tag: rgba(220, 220, 220, 0.08);\r\n  --dsw-alias-markdown-code-segment-selected: rgba(220, 220, 220, 0.12);\r\n  --dsw-alias-markdown-code-segment-unselected: rgba(220, 220, 220, 0.08);\r\n}\r\n\r\n/* ---------- 代码语法高亮（One Monokai 全色） ---------- */\r\nbody[data-ds-dark-theme] {\r\n  --shiki-token-constant: #c678dd;   /* number/constant = purple */\r\n  --shiki-token-string: #e5c07b;     /* string = gold */\r\n  --shiki-token-comment: #5c6370;    /* comment */\r\n  --shiki-token-keyword: #e06c75;    /* keyword = pink */\r\n  --shiki-token-parameter: #d19a66;  /* parameter = brown */\r\n  --shiki-token-function: #61afef;   /* function = blue */\r\n  --shiki-token-string-expression: #e5c07b;\r\n  --shiki-token-punctuation: #D4D4D4;\r\n  --shiki-token-link: #61afef;\r\n}\r\n\r\n/* ============================================================\r\n *  可选的\"去炫彩\"微调（默认全部开启，办公模式主旨）\r\n *  若想保留某类特效，删除对应规则即可。\r\n * ============================================================ */\r\n\r\n/* 1) 压掉渐变发光文字（dsh 自带的 gradient-shadow-text 特效） */\r\nbody[data-ds-dark-theme] [class*=\"gradient\"],\r\nbody[data-ds-dark-theme] [style*=\"background-clip: text\"] {\r\n  background-image: none !important;\r\n  -webkit-background-clip: initial !important;\r\n  color: var(--dsw-alias-label-primary) !important;\r\n}\r\n\r\n/* 2) 弱化 markdown 标题的发光/加亮，回归哑光层次 */\r\nbody[data-ds-dark-theme] h1,\r\nbody[data-ds-dark-theme] h2,\r\nbody[data-ds-dark-theme] h3 {\r\n  color: var(--dsw-alias-label-primary-bluish) !important;\r\n  text-shadow: none !important;\r\n}\r\n\r\n/* ============================================================\r\n *  全面对标 VS Code + One Monokai：字体与字重\r\n *  - 对话/界面字体: Segoe UI + 微软雅黑 (Copilot Chat 同款 UI 字体)\r\n *  - 代码块字体: Consolas (编辑器代码同款)\r\n *  One Monokai 强调靠颜色而非粗体, 故全面降字重去\"胖感\"\r\n * ============================================================ */\r\n\r\n/* 对话/界面字体栈: Segoe UI + 微软雅黑 (对标 VS Code Copilot Chat)\r\n   注意: monospace 必须放在 Microsoft YaHei 之后, 否则 Windows 上\r\n   monospace 的中文回退会落到宋体(SimSun)而非微软雅黑 */\r\nbody {\r\n  --dsw-font-family: 'Segoe UI', -apple-system, 'Microsoft YaHei', 'PingFang SC', sans-serif !important;\r\n  --ds-font-family-code: Consolas, 'Courier New', 'Microsoft YaHei', monospace, sans-serif !important;\r\n}\r\nbody[data-ds-dark-theme] {\r\n  --dsw-font-family: 'Segoe UI', -apple-system, 'Microsoft YaHei', 'PingFang SC', sans-serif !important;\r\n  --ds-font-family-code: Consolas, 'Courier New', 'Microsoft YaHei', monospace, sans-serif !important;\r\n}\r\nbody,\r\nbody[data-ds-dark-theme] {\r\n  font-family: var(--dsw-font-family);\r\n}\r\n\r\n/* 字重全面降档: 去\"胖感\", 对标 One Monokai 的克制\r\n   600/700 的 strong/标题降到 600 (保留层级但不过度) */\r\nbody[data-ds-dark-theme] strong,\r\nbody[data-ds-dark-theme] b {\r\n  font-weight: 600 !important;\r\n}\r\n/* 标题字重降到 600 (VS Code markdown 标题为 semibold 观感) */\r\nbody[data-ds-dark-theme] h1,\r\nbody[data-ds-dark-theme] h2,\r\nbody[data-ds-dark-theme] h3,\r\nbody[data-ds-dark-theme] h4 {\r\n  font-weight: 600 !important;\r\n}\r\n/* 其余 500 字重的界面元素(侧边栏标题/tab/触发器等)统一回 400 */\r\nbody[data-ds-dark-theme] [class*=\"title\"],\r\nbody[data-ds-dark-theme] [class*=\"Label\"],\r\nbody[data-ds-dark-theme] [class*=\"label\"],\r\nbody[data-ds-dark-theme] [class*=\"tab\"],\r\nbody[data-ds-dark-theme] [class*=\"Tab\"],\r\nbody[data-ds-dark-theme] [class*=\"trigger\"],\r\nbody[data-ds-dark-theme] [class*=\"crumb\"] {\r\n  font-weight: 400 !important;\r\n}\r\n\r\n/* ============================================================\r\n *  C 方案: 关闭字体伪造合成 (font-synthesis)\r\n *  防止浏览器在字重档位缺失时\"伪造加粗\"字形, 让 400 保持纯粹\r\n * ============================================================ */\r\nbody[data-ds-dark-theme],\r\nbody[data-ds-dark-theme] * {\r\n  font-synthesis: none !important;\r\n  -webkit-font-synthesis: none !important;\r\n}\r\n\r\n/* ============================================================\r\n *  代码块配色对标 VS Code + One Monokai\r\n *  - 底色: 淡灰 rgba(220,220,220,0.1) (VS Code textCodeBlock.background)\r\n *  - 普通代码文字: 金黄 #e5c07b (One Monokai 字符串色)\r\n *  说明: 仅覆盖无语法高亮的代码文字; shiki 高亮 token 仍保留多彩\r\n * ============================================================ */\r\nbody[data-ds-dark-theme] pre {\r\n  color: #e5c07b !important;   /* 代码块默认文字 = 金黄 */\r\n}\r\n/* 内联代码同样金黄 (VS Code 内联 code 文字偏黄) */\r\nbody[data-ds-dark-theme] :not(pre) > code {\r\n  color: #e5c07b !important;\r\n}\r\n/* 代码块/内联代码底色: 淡灰 (与 token 定义一致, 兜底) */\r\nbody[data-ds-dark-theme] pre,\r\nbody[data-ds-dark-theme] .md-code-block,\r\nbody[data-ds-dark-theme] :not(pre) > code {\r\n  background-color: rgba(220, 220, 220, 0.1) !important;\r\n}\r\n\r\n/* ============================================================\r\n *  链接与文件引用对标 VS Code Copilot Chat\r\n *  - markdown 真正超链接 <a>: 链接蓝 #61afef, hover 加下划线\r\n *  - 文件引用 chip (fileLink/fileMention/工具文件):\r\n *    浅色背景框 + 正常文字色 (Copilot Chat 文件引用样式)\r\n * ============================================================ */\r\n/* markdown 真正超链接: 蓝 */\r\nbody[data-ds-dark-theme] a {\r\n  color: #61afef !important;\r\n  text-decoration: none !important;\r\n}\r\nbody[data-ds-dark-theme] a:hover,\r\nbody[data-ds-dark-theme] a:focus {\r\n  color: #61afef !important;\r\n  text-decoration: underline !important;\r\n  text-decoration-color: #61afef !important;\r\n}\r\n\r\n/* 文件引用 chip: 浅色背景框 + 正常文字色 (对标 Copilot Chat 文件引用) */\r\nbody[data-ds-dark-theme] [class*=\"fileLink\"],\r\nbody[data-ds-dark-theme] [class*=\"fileMention\"],\r\nbody[data-ds-dark-theme] [class*=\"file\"] {\r\n  color: var(--dsw-alias-label-primary) !important;\r\n  background-color: rgba(255, 255, 255, 0.06) !important;\r\n  border-radius: 6px !important;\r\n  padding: 1px 8px !important;\r\n  text-decoration: none !important;\r\n  display: inline-block !important;\r\n}\r\n/* 文件 chip hover: 略微提亮背景, 保持正常文字色 */\r\nbody[data-ds-dark-theme] [class*=\"fileLink\"]:hover,\r\nbody[data-ds-dark-theme] [class*=\"fileLink\"]:focus,\r\nbody[data-ds-dark-theme] [class*=\"fileMention\"]:hover,\r\nbody[data-ds-dark-theme] [class*=\"fileMention\"]:focus {\r\n  color: var(--dsw-alias-label-primary) !important;\r\n  background-color: rgba(255, 255, 255, 0.12) !important;\r\n  text-decoration: none !important;\r\n}\r\n/* 文件 chip 内子元素继承文字色 */\r\nbody[data-ds-dark-theme] [class*=\"fileLink\"] *,\r\nbody[data-ds-dark-theme] [class*=\"fileMention\"] * {\r\n  color: inherit !important;\r\n}\r\n\r\n/* ============================================================\r\n *  dsh-synapse —— 会话地图 / 对话 切换浮层（顶部居中胶囊）\r\n *  默认插件的硬编码浅色（白底/灰字）在深色 UI 里突兀，归一到\r\n *  One Monokai 深色质感。\r\n * ============================================================ */\r\nbody[data-ds-dark-theme] .dsh-synapse-switch {\r\n  background: #262a32 !important;          /* 浮层中层，比对话界面略亮 */\r\n  border: 1px solid #333a43 !important;    /* 柔和深色描边 */\r\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35) !important;\r\n}\r\nbody[data-ds-dark-theme] .dsh-synapse-switch button {\r\n  color: #abb2bf !important;               /* One Monokai 正文哑光灰 */\r\n}\r\nbody[data-ds-dark-theme] .dsh-synapse-switch button:hover {\r\n  background: rgba(255, 255, 255, 0.08) !important;\r\n  color: #d4d4d4 !important;\r\n}\r\nbody[data-ds-dark-theme] .dsh-synapse-switch button[aria-pressed=\"true\"],\r\nbody[data-ds-dark-theme] .dsh-synapse-switch button.active {\r\n  /* 选中态 = 半透明白微亮（同右侧 Explorer 激活标签 rgba(255,255,255,0.08)） */\r\n  background: rgba(255, 255, 255, 0.08) !important;\r\n  color: #d4d4d4 !important;        /* 正文米白文字 */\r\n}";

		/** data-plugin-css tag id for the overlay <style> element. */
		const TAG_ID = SOURCE + "/OneMonokaiOffice.css";

		/** Locale namespace for the General settings row's copy. */
		const SETTINGS_NS = "settings." + SOURCE;

		/** localStorage key: theme on/off flag. */
		const STORAGE_KEY = SOURCE + ".enabled";

		const zh = {
			"title": "One Monokai 办公主题",
			"on": "开启",
			"off": "关闭"
		};
		const en = {
			"title": "One Monokai office theme",
			"on": "On",
			"off": "Off"
		};

		/** Read the persisted on/off flag (default enabled). */
		function readStored() {
			try {
				if (typeof localStorage === "undefined") return true;
				const v = localStorage.getItem(STORAGE_KEY);
				return v === null ? true : v !== "0" && v !== "false";
			} catch {
				return true;
			}
		}
		/** Persist the on/off flag. */
		function writeStored(enabled) {
			try {
				if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
			} catch {}
		}

		/** Create (or replace) the overlay <style> element. */
		function createStyle() {
			if (typeof document === "undefined") return null;
			const existing = document.querySelector("style[data-plugin-css=" + JSON.stringify(TAG_ID) + "]");
			if (existing !== null) existing.remove();
			const tag = document.createElement("style");
			tag.dataset.plugin = SOURCE;
			tag.dataset.pluginCss = TAG_ID;
			tag.textContent = THEME_CSS;
			document.head.appendChild(tag);
			return tag;
		}

		/** Inline CSS for the settings row. */
		const css = "._omo_group{border-bottom:1px solid var(--dsw-alias-border-l2);flex-direction:column;gap:8px;padding:16px 0;display:flex}._omo_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}._omo_toggleRow{flex-wrap:wrap;align-items:center;gap:8px;display:flex}";
		const tagId = SOURCE + "/ToggleRow.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = SOURCE;
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		const cssModule = { group: "_omo_group", title: "_omo_title", toggleRow: "_omo_toggleRow" };

		/** Store mirroring the on/off flag; written by apply() and clicks. */
		function createToggleStore() {
			return defineStore({
				init: () => ({ enabled: readStored() }),
				actions: {
					syncEnabled: (d, enabled) => { d.enabled = enabled; }
				}
			});
		}

		/** General settings row: 开启/关闭. */
		function ToggleRow({ t, setEnabled, useStore }) {
			const enabled = useStore((s) => s.enabled);
			return jsxs("div", { className: cssModule.group, children: [
				jsx("div", { className: cssModule.title, children: t("title") }),
				jsxs("div", { className: cssModule.toggleRow, children: [
					jsx(Pill, { active: enabled, onClick: () => setEnabled(true), children: t("on") }, "on"),
					jsx(Pill, { active: !enabled, onClick: () => setEnabled(false), children: t("off") }, "off")
				] })
			] });
		}

		/** Cordis service-level inject: theme + the settings-row surface services. */
		const inject = ["slots", "locale"];

		/**
		 * Client plugin body:
		 *  - inject the One Monokai office overlay <style> while enabled;
		 *  - register the settings row into the General settings item slot;
		 *  - persist the toggle to localStorage.
		 * @param ctx - client cordis context with the required services resolved.
		 */
		function apply(ctx) {
			const store = createToggleStore();
			let bound;
			let styleTag = null;

			const applyStyle = (enabled) => {
				if (enabled && styleTag === null) {
					styleTag = createStyle();
				} else if (!enabled && styleTag !== null) {
					styleTag.remove();
					styleTag = null;
				}
			};

			const setEnabled = (v) => {
				writeStored(v);
				applyStyle(v);
				bound?.syncEnabled(v);
			};

			applyStyle(readStored());

			ctx.effect(() => () => {
				if (styleTag !== null) {
					styleTag.remove();
					styleTag = null;
				}
			}, "copilot-one-monokai-office: overlay cleanup");

			ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }), "copilot-one-monokai-office: settings row dictionaries");

			const injected = (actions) => {
				bound = actions;
				return { setEnabled };
			};

			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: SOURCE,
				order: 15,
				store,
				locale: SETTINGS_NS,
				inject: injected
			}, ToggleRow));
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
