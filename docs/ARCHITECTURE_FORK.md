<!--
SPDX-FileCopyrightText: 2026 morvorus

SPDX-License-Identifier: CC-BY-NC-SA-4.0
-->

# Fork architecture

## System context

The fork is a static Phaser/Vite web application deployed by GitHub Actions to
GitHub Pages. Source code lives in the parent repository, while game assets and
translations remain pinned Git submodules.

```text
upstream/beta ──sync PR──> fork beta ──GitHub Actions──> GitHub Pages
                              │
                              ├── source and configuration
                              ├── assets submodule
                              └── locales submodule

browser <──static files── GitHub Pages
browser ──IndexedDB/local storage──> device-local save data
```

The public build uses `VITE_BYPASS_LOGIN=1`. It must remain independent of the
official API and official accounts.

## Change boundaries

Prefer changes in this order:

1. fork-specific configuration and documentation;
2. small adapters around upstream behavior;
3. isolated feature modules with tests;
4. direct upstream-file modifications only when an adapter is impractical.

This order reduces conflicts during upstream synchronization. Avoid copying
submodule contents into the parent repository.

## Data ownership

- Source and configuration changes follow repository SPDX metadata.
- `assets/` and `locales/` retain their independent history and licensing.
- Browser saves belong to the player and remain local unless an explicit,
  reviewed export or synchronization feature is introduced.
- Secrets and official service credentials are never part of a client build.

## Reliability boundaries

- A successful local build is necessary but not sufficient; the deployed URL is
  checked after every release.
- The deployment artifact should remain below the GitHub Pages 1 GB limit.
- Submodule changes require the same review as dependency upgrades.
- Save-format changes require backward compatibility, migration tests, and an
  export path before release.

## Observability

GitHub Actions is the deployment audit log. A future error-monitoring solution
must be opt-in, privacy-preserving, documented, and must not transmit save data or
player identifiers by default.
