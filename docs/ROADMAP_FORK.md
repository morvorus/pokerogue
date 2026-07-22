<!--
SPDX-FileCopyrightText: 2026 morvorus

SPDX-License-Identifier: CC-BY-NC-SA-4.0
-->

# Fork roadmap

Roadmap items are ordered by risk reduction before feature volume. Dates are set
only after an item meets the definition of ready.

## Phase 0 — Reproducible baseline (complete)

- Fork source with upstream history preserved.
- Restore pinned `assets` and `locales` submodules.
- Verify TypeScript and production builds.
- Deploy a login-bypassed static build to GitHub Pages.
- Document local setup and upstream synchronization.

## Phase 1 — Engineering foundation (current)

- Protect `beta` and require the fork quality gate.
- Enable structured issues, labels, ownership, and security reporting.
- Establish architecture decisions, definition of done, and release conventions.
- Add live-deployment smoke tests and artifact-size monitoring.
- Verify save export/import and recovery on desktop and mobile browsers.

Exit criteria: a failed build cannot reach `beta`, a new machine can reproduce the
project from documentation, and a deployment can be rolled back to a known tag.

## Phase 2 — Product identity and accessibility

- Move fork-specific UI and settings behind isolated configuration boundaries.
- Define an original project name and visual identity without removing upstream
  attribution.
- Complete Thai UX review and terminology consistency.
- Audit keyboard, controller, touch, color contrast, and reduced-motion behavior.
- Add a first-run explanation of local saves, exports, and privacy.

Exit criteria: fork-specific presentation is isolated from gameplay logic and the
main flows work across desktop and mobile input methods.

## Phase 3 — Player-value features

- Prioritize issues using user impact, implementation risk, and maintenance cost.
- Add quality-of-life features with automated regression coverage.
- Improve offline resilience, save backups, and deterministic recovery.
- Measure asset loading and reduce initial download cost.

Exit criteria: each feature has acceptance criteria, tests, migration notes when
needed, and measurable impact.

## Phase 4 — Optional services

Do not add accounts, cloud saves, telemetry, or multiplayer until there is a
documented threat model, privacy policy, retention policy, backup plan, operating
budget, and incident response process. Static local-first play remains the safe
default.

## Prioritization score

Use this lightweight score when ordering backlog items:

```text
priority = (user impact + risk reduction + learning value) - (complexity + maintenance cost)
```

Each factor is scored from 1 to 5. Security and data-loss defects override the
numeric score.
