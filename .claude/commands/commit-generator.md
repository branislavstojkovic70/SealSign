---
name: commit-generator
description: Generate a conventional commit message based on staged or recent changes
user-invocable: true
---

Generate a conventional commit message for the current changes.

## Steps

1. Run `git diff --staged` to see staged changes. If nothing is staged, run `git diff HEAD` to see unstaged changes.
2. Run `git status` to understand which files are affected.
3. Analyze the changes and determine:
   - **type**: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`, `perf`, `ci`, `build`, or `revert`
   - **scope** (optional): the area of the codebase affected (e.g. `api`, `ui`, `auth`)
   - **subject**: short imperative description, max 72 chars, no period at end
   - **body** (optional): bullet points explaining *what* and *why*, not *how* — only include if changes are non-obvious
   - **breaking change** (optional): if the change breaks backwards compatibility, add `BREAKING CHANGE:` footer

## Conventional Commit Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

## Examples

```
feat(verify): add pay-gate before showing verification result

fix(hash): align browser and server SHA-256 output to hex string

chore: add .gitignore for Next.js and Hedera key files

refactor(hedera): extract base64 decode into fetchTopicMessages helper

docs: update CLAUDE.md with data flow and env var list

BREAKING CHANGE: verification API now requires payment tx hash in request body
```

## Output

Present the commit message in a code block so it can be copied directly. Do not run `git commit` unless the user explicitly asks.
