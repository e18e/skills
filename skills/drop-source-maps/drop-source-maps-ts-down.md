# tsdown: drop sourcemap output

Applies when `tsdown.config.*` (or a `tsdown` field/script in
`package.json`) drives the build.

## Find the sourcemap declaration

```ts
export default defineConfig({
  entry: 'src/index.ts',
  sourcemap: true,
});
```

`sourcemap` defaults to `false` in tsdown, so confirm it's explicitly
enabled before assuming there's work to do.

## Change it

1. Set `sourcemap: false` or remove the option entirely to take the
   default.
2. Check for any `unbundle`/per-entry overrides that set `sourcemap`
   independently of the top-level option.

## Check after

- Re-run `tsdown` and confirm no `.map` files are emitted and no
  `//# sourceMappingURL=` comments remain.
- Return to the main skill's shared cleanup step.
