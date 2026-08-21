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
	id: __PKG_NAME__,
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
		const SOURCE = __PKG_NAME__;

		/** Full One Monokai office-mode overlay, inlined at build time. */
		const THEME_CSS = __THEME_CSS__;

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
