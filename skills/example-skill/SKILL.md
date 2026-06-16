---
name: example-skill
description: Template for a new e18e skill. Copy this directory, rename it, and rewrite this description. The description is the only thing Claude reads when deciding whether to load a skill, so state concretely what the skill does and the situations that should trigger it.
---

# Example skill

This is a starter skill. Replace everything below with instructions Claude
should follow when the skill is loaded.

## When to use

Describe the triggers in the frontmatter `description` above — that text is what
Claude matches against. Use this body for the actual instructions.

## Instructions

1. Step one.
2. Step two.
3. Step three.

## Supporting files

A skill is a directory, so you can ship anything alongside `SKILL.md` and
reference it by relative path — scripts, templates, reference docs. Point to them
from the instructions above so Claude knows when to read or run them.
