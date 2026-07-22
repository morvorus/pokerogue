<!--
SPDX-FileCopyrightText: 2026 morvorus

SPDX-License-Identifier: CC-BY-NC-SA-4.0
-->

# Security policy

## Supported version

Only the latest deployment from the `beta` branch is supported by this fork.
Older commits, local modifications, and upstream deployments are outside this
fork's support scope.

## Reporting a vulnerability

Do not open a public issue for a vulnerability, exposed credential, private save
data, or authentication problem. Use the repository's
[private vulnerability reporting](https://github.com/morvorus/pokerogue/security/advisories/new)
flow instead.

Include:

- affected commit or deployment URL;
- minimal reproduction steps;
- expected impact;
- whether private data or credentials may have been exposed; and
- a suggested fix, if known.

Never attach real credentials, access tokens, session exports, or personal save
files to a public issue.

## Deployment security model

The public GitHub Pages build runs with login bypassed and uses browser-local
storage. It must not connect to the official PokéRogue API, collect credentials,
or claim compatibility with official accounts. Repository and deployment secrets
must be stored only in GitHub Actions secrets or environments, never in source,
workflow output, issues, or build artifacts.

Browser developer tools cannot be made into a trusted security boundary. Local
save modification affects only the player's offline copy. Any future shared or
competitive feature must follow the server-authoritative controls in
[`docs/SECURITY_ARCHITECTURE.md`](docs/SECURITY_ARCHITECTURE.md); client-reported
items, Pokémon, currency, RNG, or results must never be accepted as authoritative.

## Dependency and workflow policy

- Keep the lockfile committed and install with `pnpm install --frozen-lockfile`.
- Pin third-party GitHub Actions to immutable commit SHAs.
- Review submodule commit changes as supply-chain changes.
- Run the fork quality gate before merging into `beta`.
- Rotate and revoke credentials immediately if accidental exposure is suspected.
