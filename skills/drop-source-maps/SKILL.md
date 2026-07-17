---
name: drop-source-maps
description: Drop sourcemap generation from a package's build. Detects which bundler builds the package (Vite, Rolldown, or tsdown) and follows the matching bundler-specific guide for the build-config change, then applies the shared cleanup. Use when the user asks to stop shipping sourcemaps, remove `.map` files from a build, or turn off sourcemap generation. Aborts and asks first if the output is minified, if maps are intentionally uploaded to an error-tracking service, if sourcemap support is a documented public feature, if another tool in the repo consumes the maps, or if a monorepo already has inconsistent per-package sourcemap config.
---

# Drop sourcemap generation

Remove sourcemap output from a package's build. Work in four phases:
**check for abort conditions**, **detect**, **dispatch**, **clean up**.

## 1. Check for abort conditions

Before touching any config, check for the conditions below. If any apply,
stop and tell the user which one triggered, citing the specific file/line or
config value that shows it, and why it matters — do not change anything
without their explicit go-ahead.

### Minified output

The bundler's output is minified (`build.minify`, `minify: true`, a
`.min.js` output, or mangled names in existing build output). Sourcemaps are
the only way to read a stack trace or set a breakpoint in minified code, so
dropping them here turns every future bug report into unreadable mangled
output with no way back to source.

### Hidden/production sourcemaps uploaded to an error-tracking service

Sourcemap output is set to `'hidden'` (or equivalent) and a CI/publish step
uploads the map to Sentry, Bugsnag, Datadog, Rollbar, or similar without
shipping it to consumers. This is deliberate production observability
infrastructure, not a leftover dev convenience, so removing it would
silently break stack-trace symbolication for production error monitoring.

### Sourcemaps are a documented public feature

The README, CHANGELOG, or package.json description explicitly advertises
sourcemap support as something consumers get. That's a stated contract with
users, not an internal build detail, so removing it needs their explicit
sign-off.

### Another in-repo tool consumes the sourcemaps

Test coverage tooling (Istanbul/c8 mapping coverage back to source), a
profiler, or `NODE_OPTIONS=--enable-source-maps` in test/CI scripts relies on
the maps. Removing sourcemaps here would silently break a different
subsystem's correctness, not just external debugging.

### Inconsistent per-package sourcemap config in a monorepo

Some packages already have sourcemaps off and others on. That split is
likely an existing deliberate decision, so blanket-applying this skill
across every package could undo it.

## 2. Detect the bundler

Look for evidence of the build tool, in this order:

1. Config files in the project root: `vite.config.*` → Vite,
   `rolldown.config.*` → Rolldown, `tsdown.config.*` → tsdown.
2. If no config file, check `package.json` `dependencies`/`devDependencies`
   for `vite`, `rolldown`, or `tsdown`.
3. If more than one is present (e.g. Vite using Rolldown under the hood),
   prefer the outermost build tool actually invoked by the `build` script in
   `package.json` — read that script to see which CLI runs.

If none of the three match, stop and tell the user which bundler you found
instead (e.g. tsup, unbuild, rollup, esbuild, webpack) — this skill only has
steps for Vite, Rolldown, and tsdown today. Ask whether they want you to
proceed by hand or skip the build-config change.

## 3. Dispatch to the bundler-specific guide

Read the matching file in this same directory and follow its steps for the
build-config half of the change:

- Vite → `drop-source-maps-vite.md`
- Rolldown → `drop-source-maps-roll-down.md`
- tsdown → `drop-source-maps-ts-down.md`

Each guide covers only what's specific to that tool: which config option
currently turns sourcemaps on, what to change it to, and what to check after
removing it. Do the config-file change first, then come back here for the
shared cleanup below.

## 4. Shared cleanup (all bundlers)

Regardless of which bundler was used, apply these once the build config
itself no longer emits sourcemaps:

- **`package.json`**
  - Remove `files`/`exports` entries that reference `*.map`.
  - Drop devDependencies that existed only to consume or upload sourcemaps
    (e.g. `source-map-support`, a Sentry/Bugsnag/Datadog CLI sourcemap-upload
    package) once they're no longer referenced.
- **CI/publish config**
  - Search for and flag (don't silently remove) any pipeline step that
    uploads sourcemaps to an error-tracking service — if one exists and
    wasn't already caught by the abort check above, treat it the same way:
    stop and confirm before removing it.
- **`.gitignore`/`.npmignore`**
  - Clean up now-stale `*.map` ignore/include entries.
- **Downstream**
  - Note in the final report that consumers debugging the published package
    in devtools lose sourcemap support. Check the README for any
    "sourcemaps included"-style claim that wasn't already caught by the
    abort check.
- **Verify**
  - Rebuild and confirm no `.map` files are emitted and no
    `//# sourceMappingURL=` comments remain in the output, then report what
    changed.
