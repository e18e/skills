# Vite: drop sourcemap output

Applies when `vite.config.*` (or `vite` in `package.json`) drives the build,
typically in library mode (`build.lib`).

## Find the sourcemap declaration

Look in `vite.config.*` for `build.sourcemap`:

```js
export default defineConfig({
  build: {
    sourcemap: true, // <- or 'inline' / 'hidden'
  },
});
```

`sourcemap` defaults to `false`, so confirm it's explicitly enabled before
assuming there's work to do. Also check `build.lib` +
`rollupOptions.output` — an `output` array/object can set `sourcemap` per
entry, overriding the top-level setting.

## Change it

1. Set `build.sourcemap: false` (or remove the option to take the default).
2. If `rollupOptions.output` is an array with per-entry `sourcemap`
   overrides, remove each one rather than relying on the top-level setting
   to cascade.
3. Check any `vite-plugin-*` that reads or writes sourcemaps itself (e.g. a
   CSS or legacy-output plugin generating its own map) — these often have
   an independent `sourcemap` option not controlled by `build.sourcemap`.

## Check after

- Re-run `vite build` and confirm no `.map` files are emitted and no
  `//# sourceMappingURL=` comments remain in the output.
- Return to the main skill's shared cleanup step.
