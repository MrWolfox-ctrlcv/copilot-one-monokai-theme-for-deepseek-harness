/* dsh-oneoffice — zero-dependency build script.
 *
 * Reads package.json (plugin id) and one-monokai-office.css, extracts the
 * iframe overlay block (between __OMO_IFRAME__ and __END_OMO_IFRAME__)
 * separately, injects both into the client bundle template, and writes the
 * final self-contained bundle to client.js.
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

const fullCss = readFileSync(cssFile, "utf8");

// --- Extract the iframe overlay block (for nested-document theming) ---
const IFRAME_START = "__OMO_IFRAME__";
const IFRAME_END = "__END_OMO_IFRAME__";
const startIdx = fullCss.indexOf(IFRAME_START);
const endIdx = fullCss.indexOf(IFRAME_END);

let mainCss;
let iframeCss = "";

if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
  // main CSS: everything before the iframe block's opening marker
  mainCss = fullCss.slice(0, startIdx - 1).trim();
  // iframe CSS: from after the opening marker to before the closing marker
  iframeCss = fullCss.slice(startIdx + IFRAME_START.length, endIdx - 1).trim();
} else {
  mainCss = fullCss.trim();
}

const tpl = readFileSync(template, "utf8");

const bundle = tpl
	.replaceAll("__PKG_NAME__", JSON.stringify(pkg.name))
	.replaceAll("__THEME_CSS__", JSON.stringify(mainCss))
	.replaceAll("__IFRAME_CSS__", JSON.stringify(iframeCss));

const out = join(root, "client.js");
writeFileSync(out, bundle);

console.log(
	`${pkg.name}: built client.js — ${mainCss.length} bytes main CSS + ${iframeCss.length} bytes iframe CSS`
);
