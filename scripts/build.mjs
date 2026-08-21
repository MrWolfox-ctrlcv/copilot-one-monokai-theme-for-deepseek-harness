/* copilot-one-monokai-office — zero-dependency build script.
 *
 * Reads package.json (plugin id) and one-monokai-office.css (the full
 * self-contained dark overlay), injects the CSS into the client bundle
 * template, and writes the final self-contained browser bundle to client.js.
 *
 *   node scripts/build.mjs     (or: npm run build)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const cssFile = join(root, "one-monokai-office.css");
const template = join(root, "src", "bundle.template.js");

const css = readFileSync(cssFile, "utf8").trim();
const tpl = readFileSync(template, "utf8");

const bundle = tpl
	.replaceAll("__PKG_NAME__", JSON.stringify(pkg.name))
	.replaceAll("__THEME_CSS__", JSON.stringify(css));

const out = join(root, "client.js");
writeFileSync(out, bundle);

console.log(
	`${pkg.name}: built client.js — ${css.length} bytes of theme CSS inlined from one-monokai-office.css`
);
