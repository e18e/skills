---
name: esm-migration
description: Migrate a package that currently ships dual ESM+CJS output to ESM-only. Detects which bundler builds the package (Vite, Rolldown, or tsdown) and follows the matching bundler-specific guide for the build-config changes, then applies the shared package.json/source-level ESM cleanup. Use when the user asks to drop CJS output, go ESM-only, fix a dual-package hazard, or migrate to "type": "module".
---

# ESM migration (dual → ESM-only)

Migrate a package that currently builds both ESM and CJS output down to
ESM-only. Work in three phases: **detect**, **dispatch**, **clean up**.

## 1. Detect the bundler

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
migration steps for Vite, Rolldown, and tsdown today. Ask whether they want
you to proceed by hand or skip the build-config change.

## 2. Dispatch to the bundler-specific guide

Read the matching file in this same directory and follow its steps for the
build-config half of the migration:

- Vite → `esm-migration-vite.md`
- Rolldown → `esm-migration-roll-down.md`
- tsdown → `esm-migration-ts-down.md`

Each guide covers only what's specific to that tool: which config option
currently declares dual output, what to change it to, and what to check
after removing CJS. Do the config-file change first, then come back here for
the shared cleanup below — the config change alone rarely finishes the job.

## 3. Shared cleanup (all bundlers)

Regardless of which bundler was used, apply these once the build config
itself only emits ESM:

- **`package.json`**
  - Set `"type": "module"`.
  - Collapse `exports` to a single ESM condition per entry point (drop
    `"require"` conditions); remove `main`'s CJS path or point it at the ESM
    output; drop `module` (redundant once there's no CJS to disambiguate
    from).
  - Remove any `bin` scripts that assume `require()`-style loading.
  - If the ESM-only build now needs a newer Node (e.g. for `exports`
    resolution or top-level `await`), don't bump `engines.node` silently —
    flag the new minimum version to the user and confirm before raising it,
    since it's a breaking change for consumers on older Node.
  - Drop dependencies that existed only to shim CJS/ESM interop (e.g.
    `cjs-module-lexer`-style helpers, manual `createRequire` polyfills) once
    they're no longer referenced.
- **Source**
  - Replace `__dirname`/`__filename` with
    `import.meta.url` + `fileURLToPath`.
  - Replace `require()`/`module.exports` with `import`/`export`; replace
    JSON `require()` with an import assertion/`with { type: 'json' }` or a
    `fs.readFileSync` + `JSON.parse`.
  - Check for `require.resolve` usage and replace with
    `import.meta.resolve` where the target Node range supports it.
  - Check any conditional `typeof require !== 'undefined'` dual-mode branches
    and delete the CJS branch.
- **Downstream**
  - Search the repo (and, if this is a published package, its README/docs)
    for CJS-only consumption examples (`require('pkg')`). Don't edit these
    silently — flag each one you find (file/line, or doc section) to the
    user and confirm before rewriting, since published docs are user-facing
    and a user may want to keep a CJS example alongside the ESM one rather
    than replace it.
  - Run the project's typecheck, tests, and build to confirm the ESM-only
    output actually works, then report what changed.
