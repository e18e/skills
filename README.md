# e18e skills

Claude skills from the [e18e](https://e18e.dev) community, distributed as a
Claude Code plugin marketplace.

## Install

```sh
# Add the marketplace (once)
/plugin marketplace add e18e/skills

# Install the skills plugin
/plugin install skills@e18e
```

## Layout

```
.claude-plugin/
  marketplace.json        # the "e18e" marketplace — lists this plugin
  plugin.json             # the "skills" plugin
skills/                   # one directory per skill, each with a SKILL.md
  example-skill/
    SKILL.md
scripts/
  validate.mjs            # checks every SKILL.md's frontmatter
```

This repo is a single plugin. To grow beyond skills, add `commands/`, `agents/`,
or `hooks/` at the root, or list additional plugins from other e18e repos in
`marketplace.json`.

## Add a skill

1. Copy `skills/example-skill` to a new directory.
2. Rename the directory; set `name` in the frontmatter to match it.
3. Rewrite `description` — it's the only text Claude uses to decide when to load
   the skill, so be concrete about what it does and when to trigger it.
4. Write the instructions in the body.

## Scripts

```sh
npm run format     # format with oxfmt
npm run validate   # validate skill frontmatter
```
