# Drawing Tools Feature Flags — Deprecated and Always On

Summary

- Feature flags for Drawing Tools have been removed at build-time and at runtime. Drawing tools are always exported and always enabled.
- Backward-compat API remains for compatibility: [isEnabled()](lightweight-charts/src/feature-flags.ts:6), [requireEnabled()](lightweight-charts/src/feature-flags.ts:11), [ensureFeatureFlagEnabled()](lightweight-charts/src/feature-flags.ts:15), [setFeatureFlags()](lightweight-charts/src/feature-flags.ts:19), [getFeatureFlag()](lightweight-charts/src/feature-flags.ts:23), [allFlags()](lightweight-charts/src/feature-flags.ts:28), [resetFeatureFlags()](lightweight-charts/src/feature-flags.ts:37) are now no-ops and always report enabled.
- Bundles always include drawing exports. See rollup injection in [rollup.config.js](lightweight-charts/rollup.config.js:56) and the verification unit test [bundle-flags-off.spec.ts](lightweight-charts/tests/unittests/drawing/bundle-flags-off.spec.ts:6), which now asserts the default bundle contains Rectangle exports.
- Demos and E2E no longer require toggling any flag. If a demo still calls [setFeatureFlags()](lightweight-charts/src/feature-flags.ts:19), it is a harmless no-op and can be removed later.

Why this change

- Real-world incidents were traced to mismatches between build modes and feature flags. Removing gates eliminates a class of configuration errors across CLI/TDS, demos, and E2E.
- We keep a thin compatibility shim to avoid breaking external code that might still import the feature flag helpers.

Compatibility and behavior

- Always enabled: [isEnabled()](lightweight-charts/src/feature-flags.ts:6) and [getFeatureFlag()](lightweight-charts/src/feature-flags.ts:23) return true for any name.
- No runtime guards: [requireEnabled()](lightweight-charts/src/feature-flags.ts:11) and [ensureFeatureFlagEnabled()](lightweight-charts/src/feature-flags.ts:15) never throw.
- No-op configuration: [setFeatureFlags()](lightweight-charts/src/feature-flags.ts:19) and [resetFeatureFlags()](lightweight-charts/src/feature-flags.ts:37) do nothing.
- Bundle exports: Drawing tools are always injected by Rollup, independent of environment variables. See [rollup.config.js](lightweight-charts/rollup.config.js:56).

Migration guide

1) Remove flag toggling from applications and demos.
- Before (old docs suggested):
```js
import { setFeatureFlags } from 'lightweight-charts/feature-flags';
setFeatureFlags({
  drawingTools: true,
  'drawingTools.rectangle': true,
});
```
- After:
```js
// No flags needed. Use the drawing tools directly.
```

2) Remove runtime guards.
- Before:
```js
import { ensureFeatureFlagEnabled } from 'lightweight-charts/feature-flags';
ensureFeatureFlagEnabled('drawingTools.rectangle', 'my-setup'); // may throw previously
```
- After:
```js
// Guard is not necessary; API is always available.
```

3) Keep compatibility imports if needed (they’re harmless).
- If you can’t remove [setFeatureFlags()](lightweight-charts/src/feature-flags.ts:19) calls right away, leaving them in place won’t change behavior.

4) Tests
- Unit: [feature-flags.spec.ts](lightweight-charts/tests/unittests/drawing/feature-flags.spec.ts:11) now asserts construction succeeds with no flags (always enabled).
- Bundle: [bundle-flags-off.spec.ts](lightweight-charts/tests/unittests/drawing/bundle-flags-off.spec.ts:6) asserts the production ESM bundle exports RectangleDrawingPrimitive, RectangleDrawingTool, rectangleSpec.
- E2E: keep or add minimal smoke tests that construct and attach rectangles without flags:
  - [rectangle-businessday-e2e.js](lightweight-charts/tests/e2e/interactions/test-cases/drawing/rectangle-businessday-e2e.js:1)
  - rectangle-autoscale-vertical-only-e2e.js (add if missing)
  - rectangle-attach-detach-e2e.js (add if missing)
  - rectangle-flags-off.js should be updated to simply verify construction/attach works without relying on any flag.

Developer quick start

- Build Standalone:
  - npm run build:prod
- Minimal interaction flow (Add → Complete → Edit → Undo/Redo → Autoscale → Delete):
  - npm run e2e:rectangle
- Full verification (Windows-friendly instructions may be required for local PowerShell policies; CI is the source of truth):
  - npm run verify

Important behavior: Rectangle autoscale is vertical-only

- Rectangle autoscale only affects the vertical price range. It does not change or shift the horizontal time scale window.
- To view the full time span, continue using chart.timeScale().fitContent() and other time-scale APIs.
- This preserves predictable chart navigation for users and avoids drawing tools changing the viewed time range.

FAQ

- Do I still need to import or call feature flags? No. The helpers remain exported only for backward compatibility; they are no-ops.
- Will removing my setFeatureFlags() calls break behavior? No. Tools are always on; removing calls is recommended to simplify code.
- What about size-limit dual baselines? No longer necessary for flags-off/flags-on. Maintain a single baseline for the default bundle, since drawing exports are always present.

Changelog

- Wave0 Finalization: removed feature flag build/runtime gates, always-on drawing exports, compatibility shim retained in [src/feature-flags.ts](lightweight-charts/src/feature-flags.ts:1), and bundle injection in [rollup.config.js](lightweight-charts/rollup.config.js:56).
- Docs updated to reflect always-on behavior and to emphasize autoscale vertical-only semantics.

Appendix: Legacy content

- Earlier versions of this document described dot-key enabling and flags-off/on build modes. Those instructions are deprecated and intentionally removed to avoid confusion.