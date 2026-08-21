/* copilot-one-monokai-office — host half (dual-face package shape, mirroring
 * the official dsh-client-* packages).
 *
 * The loader mounts a cordis entry for this package by its root export; the
 * modules node half only composes client bundles from entries that mounted a
 * fiber. This theme needs no host-side behaviour — the whole effect lives in
 * the client half (client.js), which injects the One Monokai office-mode
 * overlay stylesheet into the web shell. Keeping a real (no-op) host apply
 * makes the fiber mount so the client bundle reaches window.__DSH_BOOT__.
 */

/** Stable Cordis plugin name. */
const name = "copilot-one-monokai-office";

/** No host-side services or registries are required by this theme. */
function apply() {}

export { apply, name };
