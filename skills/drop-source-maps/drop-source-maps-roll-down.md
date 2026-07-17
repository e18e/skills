# Rolldown: drop sourcemap output

Applies when `rolldown.config.*` (or Rolldown invoked directly/via a
wrapper) drives the build. Rolldown's config API mirrors Rollup's, so
sourcemap output is usually set per `output` object rather than at the top
level.

## Find the sourcemap declaration

```js
export default defineConfig({
  input: 'src/index.ts',
  output: [
    { format: 'es', dir: 'dist', sourcemap: true }, // <- sourcemap output
  ],
});
```

Also check for a config exported as an array of whole config objects
(`export default [esmConfig, cjsConfig]`) — each may set `sourcemap`
independently.

## Change it

1. Remove `sourcemap` (or set it to `false`) on every `output` object — in a
   multi-entry setup it needs removing from each entry individually, since
   it isn't inherited from a top-level default.
2. If `sourcemap: 'hidden'` is set anywhere, treat this as a possible abort
   condition (see the main skill) before removing it — it usually means maps
   are intentionally generated for upload but not shipped to consumers.

## Check after

- Re-run the Rolldown build and confirm no `.map` files are emitted.
- Return to the main skill's shared cleanup step.
