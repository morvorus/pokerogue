<!--
SPDX-FileCopyrightText: 2026 morvorus

SPDX-License-Identifier: CC-BY-NC-SA-4.0
-->

# Fork development workflow

This repository is a development fork of
[`pagefaultgames/pokerogue`](https://github.com/pagefaultgames/pokerogue).
Keep the original copyright notices, credits, SPDX metadata, and licenses when
redistributing changes.

## Repository remotes

- `origin`: `https://github.com/morvorus/pokerogue.git`
- `upstream`: `https://github.com/pagefaultgames/pokerogue.git`

Verify the configuration with:

```powershell
git remote -v
```

## Set up a new Windows machine

Install Git, Node.js 24.9 or newer, and pnpm 10.33.2. Then run:

```powershell
git clone --recurse-submodules https://github.com/morvorus/pokerogue.git
cd pokerogue
git remote add upstream https://github.com/pagefaultgames/pokerogue.git
corepack enable
corepack prepare pnpm@10.33.2 --activate
pnpm install --frozen-lockfile
pnpm start:dev
```

If the repository was cloned without submodules, restore them with:

```powershell
git submodule sync --recursive
git submodule update --init --recursive --depth 1
```

## Validate changes

Run these checks before pushing a branch:

```powershell
pnpm typecheck
pnpm biome:ci
pnpm test
pnpm build
```

The production build is written to the ignored `dist/` directory.

## Branching

Keep `beta` aligned with the upstream project. Develop changes on dedicated
branches such as `feature/custom-ui` or `fix/save-loading`:

```powershell
git switch beta
git pull --ff-only origin beta
git switch -c feature/my-change
```

Commit only intentional files after reviewing the staged diff:

```powershell
git status
git diff
git add path/to/file
git diff --staged
git commit -m "feat: describe the change"
git push -u origin feature/my-change
```

## Sync from upstream

Update the fork's `beta` branch without rewriting history:

```powershell
git fetch upstream
git switch beta
git merge --ff-only upstream/beta
git submodule sync --recursive
git submodule update --init --recursive --depth 1
git push origin beta
```

If a fast-forward merge is not possible, stop and review the divergence before
merging. Do not force-push the shared `beta` branch.

## Assets and locales

`assets/` and `locales/` are Git submodules. The parent repository stores their
exact commit identifiers rather than copying their contents into this repository.
This preserves provenance and allows another machine to reproduce the same
checkout with `--recurse-submodules`.

Do not remove or replace licensing information. Files in `assets/` without
explicit licensing metadata should be treated as having unknown redistribution
rights.
