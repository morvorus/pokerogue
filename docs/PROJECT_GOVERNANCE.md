<!--
SPDX-FileCopyrightText: 2026 morvorus

SPDX-License-Identifier: CC-BY-NC-SA-4.0
-->

# Project governance

## Mission

Maintain a reproducible, independently deployable development fork while keeping
upstream provenance, licenses, credits, and submodule history intact. Changes
should improve reliability, maintainability, accessibility, localization, or
gameplay without depending on the official service.

## Source-of-truth branches

- `beta`: protected, deployable, and always expected to build.
- `agent/*`, `feature/*`, `fix/*`, `docs/*`, `chore/*`: short-lived work branches.
- `upstream/beta`: read-only reference for Pagefault Games updates.

No feature work is committed directly to `beta`. Every change uses a pull request
with a conventional title, a test plan, and a rollback note when deployment
behavior changes.

## Change classes

| Class | Examples | Minimum evidence |
| --- | --- | --- |
| Documentation | Guides, ADRs, comments | Link and rendering review |
| Low risk | Copy, styles, isolated refactor | Typecheck and targeted manual test |
| Medium risk | UI flow, game rules, save format | Automated tests, build, manual regression |
| High risk | Auth, persistence, deployment, dependencies | Threat review, migration and rollback plan |

## Definition of ready

Work is ready to start when it has a clear user or developer outcome, acceptance
criteria, known dependencies, risk classification, and a test approach. Large
changes are split into independently reviewable increments.

## Definition of done

A change is done only when:

1. acceptance criteria are satisfied;
2. relevant automated checks pass;
3. manual verification is recorded for user-facing behavior;
4. licenses and SPDX metadata are correct;
5. documentation and ADRs are updated when behavior or architecture changes;
6. the deployment and rollback impact is understood; and
7. the pull request is merged without bypassing required checks.

## Releases and deployment

Merges to `beta` deploy automatically to GitHub Pages. Treat deployment as a
release event: review the live site, verify the disclaimer, and record material
user-facing changes. Use annotated tags in the form `fork-vYYYY.MM.PATCH` for
stable checkpoints.

## Upstream synchronization

Sync upstream in a dedicated `chore/sync-upstream-YYYY-MM-DD` branch. Do not mix
upstream synchronization with fork features. Review submodule pointers, resolve
conflicts deliberately, run the full quality gate, and preserve upstream commits
without rebasing shared history.

## Decision records

Architecture decisions that affect deployment, persistence, data ownership,
security boundaries, or long-term maintenance are recorded under
`docs/decisions/`. Superseded decisions remain in history and link to their
replacement.
