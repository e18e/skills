# Rolldown: dual ESM+CJS → ESM-only

Applies when `rolldown.config.*` (or `rolldown` invoked directly/via a
wrapper) drives the build. Rolldown's config API mirrors Rollup's, so dual
output is usually declared as multiple entries in the `output` array.

## Find the dual-output declaration

```js
export default defineConfig({
  input: "src/index.ts",
  output: [
    { format: "es", dir: "dist" },
    { format: "cjs", dir: "dist", entryFileNames: "[name].cjs" }, // <- dual output
  ],
});
```

Also check for a second whole config object exported as an array
(`export default [esmConfig, cjsConfig]`) — some setups split formats this
way instead of using multiple `output` entries on one config.

## Change it

1. Delete the `cjs` output object (or the whole second config object, if
   that's the pattern used).
2. If the ESM output object had settings duplicated only to differentiate it
   from the CJS one (e.g. `entryFileNames` disambiguating `.mjs` vs `.cjs`),
   simplify back to a plain extension.
3. Check `output.exports` (`'auto' | 'named' | 'default'`) — this setting
   exists specifically for CJS/ESM interop concerns; with CJS gone it can
   usually stay `'auto'` or be removed if it was only set to satisfy the CJS
   output's needs.
4. Remove any `output.interop` overrides that were only needed for the CJS
   consumers.

## Check after

- If a `.d.cts` type-declaration output was generated alongside `.d.ts`,
  remove that generation step.
- Re-run the Rolldown build and confirm only ESM artifacts are emitted, then
  return to the main skill's shared cleanup step for `package.json` and
  source changes.
