<!--
SPDX-FileCopyrightText: 2026 morvorus

SPDX-License-Identifier: CC-BY-NC-SA-4.0
-->

# Security architecture and anti-cheat boundary

## What is protected now

The public deployment is a static, offline-first game. Progress, inventory, and
Pokémon state are stored in the player's browser. A player who changes their own
browser memory or local storage changes only their local copy; there is currently
no shared economy, competitive leaderboard, or authoritative multiplayer state
for that modification to corrupt.

Production releases use a restrictive Content Security Policy, SHA-384
Subresource Integrity on entry scripts and styles, an SHA-256 inventory of every
deployed file, immutable Git releases, pinned GitHub Actions, minimal workflow
permissions, protected `beta`, and a production security gate. These controls
reduce unauthorized site modification and supply-chain risk.

The daily-run JSON validator is compiled into static JavaScript during the build;
production CSP therefore does not permit `unsafe-eval`.

## Browser developer tools are not a security boundary

The browser and device belong to the player. JavaScript, WebAssembly, memory,
network calls, and browser storage can be inspected or changed by that player.
Blocking F12, right-click, or common DevTools shortcuts is bypassable, harms
accessibility, and does not protect state. Obfuscation and client-side checksums
increase effort only; any verification secret shipped to the browser is no
longer secret.

Therefore no competitive reward, trade, leaderboard result, premium item,
account entitlement, or shared Pokémon record may trust client-supplied state.

## Required design before shared online features

The online backend must be server-authoritative:

1. The client sends an authenticated intent, never the resulting state.
2. The server validates ownership, legal moves, item use, encounter transitions,
   resource balances, version counters, and rate limits.
3. The server owns RNG seeds and advances them deterministically; clients cannot
   submit a preferred roll.
4. Each mutation uses an idempotency key and a database transaction so retries
   cannot duplicate rewards.
5. Saves use monotonic revisions. Stale or conflicting writes are rejected.
6. Competitive runs store an append-only event log and are replay-verified before
   rewards or rankings become final.
7. Offline snapshots may be server-signed for tamper evidence, but reconnecting
   clients never overwrite authoritative state without replay validation.
8. Administrative actions require separate roles, strong MFA, short-lived
   credentials, audit logs, and no browser-embedded secrets.

## Deployment trust chain

Only a pull request commit that passes required checks may enter `beta`. GitHub
Actions builds that exact commit with the lockfile and pinned submodules. The
artifact receives a release manifest and is verified before upload. Standby
releases are immutable and production switches by release ID, preserving a known
good rollback target.

Repository owners must enable phishing-resistant MFA or a passkey, keep recovery
codes offline, review active sessions and deploy keys, and never approve an
unexpected OAuth application. Account takeover remains capable of authorizing a
valid-looking release, so account security is part of the trust boundary.
