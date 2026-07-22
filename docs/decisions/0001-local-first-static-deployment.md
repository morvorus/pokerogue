<!--
SPDX-FileCopyrightText: 2026 morvorus

SPDX-License-Identifier: CC-BY-NC-SA-4.0
-->

# ADR 0001: Local-first static deployment

- Status: Accepted
- Date: 2026-07-22

## Context

The fork needs to be playable from multiple devices without relying on the
official PokéRogue API or possessing official service credentials. The current
application can run with login bypassed and store progress in the browser.

## Decision

Deploy a production static build to GitHub Pages with `VITE_BYPASS_LOGIN=1` and a
non-routable local API URL. Keep player progress device-local and provide no
account or cloud-save claim.

## Consequences

- The deployment is reproducible and has no application server to operate.
- Saves do not synchronize automatically between browsers or devices.
- Clearing site data can remove progress, so export/import reliability is a
  Phase 1 priority.
- Any future backend requires a separate ADR, threat model, privacy policy, and
  migration plan.
