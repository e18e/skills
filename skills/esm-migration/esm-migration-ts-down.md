# tsdown: dual ESM+CJS → ESM-only

Applies when `tsdown.config.*` (or a `tsdown` field/script in
`package.json`) drives the build.

## Find the dual-output declaration

```ts
export default defineConfig({
  entry: 'src/index.ts',
  format: ['esm', 'cjs'], // <- dual output
});
```

`format` defaults to `['esm']` alone in newer tsdown versions, so also check
for it being unset (already ESM-only) versus explicitly listing `'cjs'`.

## Change it

1. Set `format: ['esm']` (or remove `format` entirely to take the default,
   if the installed tsdown version defaults to ESM-only).
2. Check `dts` options — tsdown emits `.d.ts` for ESM and `.d.cts` for CJS
   when both formats are requested; with `cjs` removed, confirm only `.d.ts`
   is produced.
3. Check `unbundle`/`outExtensions` overrides that were keyed by format to
   pick `.mjs` vs `.cjs`; simplify to the ESM extension.
4. If `exports` generation is delegated to tsdown (some setups let it write
   `package.json#exports` for you), re-run the build and diff the generated
   `exports` map instead of hand-editing it — then skip the `exports` part
   of the shared cleanup step to avoid clobbering what tsdown wrote.

## Check after

- Re-run `tsdown` and confirm only ESM artifacts (and `.d.ts`, not `.d.cts`)
  are emitted, then return to the main skill's shared cleanup step for
  `package.json` and source changes (unless tsdown manages `exports` for
  you, per above).
