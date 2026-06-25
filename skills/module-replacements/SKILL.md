---
name: module-replacements
description: Find dependencies in a JavaScript/TypeScript codebase that can be replaced with a leaner alternative, a native built-in, an inline snippet, or removed entirely, then apply the swaps the user confirms. Use when the user asks to check their code for replaceable packages, slim down dependencies, drop a bloated module, swap a package for a native feature, or modernise their dependency tree. Backed by the e18e module-replacements dataset.
---

# Module replacements

Suggest and apply dependency replacements from the e18e `module-replacements`
dataset. The dataset is bundled with this skill as `replacements.json`, so no
network or extra install is needed.

Work in three phases: **find**, **confirm**, then **apply**. Never edit code
before the user has confirmed which replacements to make.

## 1. Find candidates

Gather the module names used in the project, then match them against the dataset.

1. Collect candidate specifiers from two places:
   - **Declared dependencies** — `dependencies`, `devDependencies`,
     `optionalDependencies`, and `peerDependencies` in `package.json` (check
     every `package.json` in a monorepo/workspace).
   - **Source imports** — grep the source for what is actually imported, e.g.
     `import x from 'pkg'`, `require('pkg')`, and dynamic `import('pkg')`. This
     catches packages used directly and lets you point to real call sites later.
2. Run the matcher with the collected names:

   ```sh
   node ./match.ts <name> <name> ...
   ```

   `<skill-dir>` is the directory containing this `SKILL.md`. With no arguments
   it falls back to reading `./package.json`, but prefer passing the names you
   gathered (including ones found only in source) so source-only usage is
   covered. The matcher normalises subpaths (`lodash/get` → `lodash`) and prints
   the matching dataset entries as JSON.

Each matched entry has a `moduleName`, an optional `docUrl`, and one or more
`replacements`. Every replacement has a `type` that determines how to apply it:

- **`documented`** — swap to another package (`replacementModule`); a leaner,
  better-maintained equivalent.
- **`native`** — drop the package for a built-in platform feature (`description`
  explains which; `nodeFeatureId`/`webFeatureId` identify it). Mind `engines`.
- **`simple`** — replace usage with a short inline snippet (`description`, and
  `example` code when present); typically a micro-utility you don't need a
  dependency for.
- **`removal`** — the package can be removed outright (`description` says why).

`preferred: true` marks a recommended choice when several are listed. `engines`
(an array of `{ engine, minVersion, maxVersion }`) lists the engine support a
`native` feature needs — flag these against the project's support targets before
suggesting the swap.

## 2. Confirm with the user

Present the matches grouped by current module. For each, state the suggested
replacement(s), the type/rationale in a few words, any engine caveats, and the
`docUrl`. When several replacements are offered, lead with the `preferred` one
and only allow the user to choose one.

Then ask the user which to apply. Do not proceed to editing until they choose.
They may pick a subset.

## 3. Apply the confirmed replacements

For each confirmed replacement:

- **`documented`** — install the replacement and remove the old package from
  `package.json`; update import specifiers and adapt call sites to the new
  module's API. The APIs are not always drop-in: consult `docUrl` (fetch it if
  helpful) or your knowledge of both packages, and don't assume identical
  signatures.
- **`native`** — replace the package's usage with the built-in (per
  `description`/`example`) and remove the dependency.
- **`simple`** — inline the `example` snippet at each call site (adapt naming to
  the surrounding code) and remove the dependency.
- **`removal`** — delete the import and its usage, and remove the dependency.

After editing, run the project's typecheck/tests/build to confirm nothing broke,
and report what changed. Update the lockfile if dependencies changed.
