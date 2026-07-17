# Vite: dual ESM+CJS → ESM-only

Applies when `vite.config.*` (or `vite` in `package.json`) drives the build,
typically in library mode (`build.lib`).

## Find the dual-output declaration

Look in `vite.config.*` for `build.lib.formats`:

```js
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'], // <- dual output
    },
  },
});
```

`formats` may also implicitly default to `['es', 'umd']` or `['es', 'cjs']`
depending on whether `name` is set — check the resolved config, not just
what's written, if `formats` is omitted.

## Change it

1. Set `formats: ['es']`.
2. If `fileName` is a function keyed by format (e.g.
   `fileName: (format) => \`index.\${format === 'cjs' ? 'cjs' : 'js'}\``),
   simplify it to a single ESM filename.
3. Remove any `rollupOptions.output` entries that duplicate CJS-specific
   settings (e.g. a second object in an `output` array with
   `format: 'cjs'`).
4. If `build.lib.cssFileName` or externals were conditioned on format, drop
   the CJS branch.

## Check after

- `optimizeDeps`/`ssr.noExternal` entries that assumed CJS interop for this
  package's own output (rare, but check if the repo also consumes its own
  build in a test/example app).
- Any `vite-plugin-dts` or similar plugin config that emits per-format
  `.d.ts`/`.d.cts` — drop the `.d.cts` output once CJS is gone.
- Re-run `vite build` and confirm only ESM artifacts are emitted, then return
  to the main skill's shared cleanup step for `package.json` and source
  changes.
