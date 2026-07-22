<!--
SPDX-FileCopyrightText: 2026 morvorus

SPDX-License-Identifier: CC-BY-NC-SA-4.0
-->

# Hosting migration runbook

## Safety objective

Keep GitHub Pages as production until a replacement passes the same build and
integrity checks. Never delete the old deployment during cutover. Browser saves
belong to an origin, so a provider URL change requires either a stable custom
domain or an explicit browser-save transfer.

## Readiness thresholds

- Below 850 MiB: normal operation; review size monthly.
- At 850 MiB: freeze nonessential large assets and test the standby host.
- At 900 MiB: schedule cutover; only critical releases may add size.
- Hard CI limit: 900 MiB, leaving about 100 MiB below the GitHub Pages 1 GB
  supported limit for packaging variance and emergency fixes.

Every production artifact contains:

- `/hosting-release.json` with the Git commit and SHA-256 hashes of every file.
- `/migration-assistant.html` for transactional export/import of browser saves.

## Preparation (no production change)

1. Build the exact `beta` commit with pinned dependencies and initialized submodules.
2. Run `node scripts/prepare-hosting-release.mjs dist`.
3. Run `node scripts/verify-hosting-release.mjs dist`.
4. Deploy the same `dist` directory to an isolated standby URL.
5. Run the verifier against the standby URL with `EXPECTED_RELEASE=<git-sha>`.
6. Play-test a new run, resume each save slot, audio, localization, touch controls,
   refresh, PWA install, and offline reload.
7. Record the old URL, new URL, release SHA, test time, and rollback owner.

## Save continuity

The preferred solution is a custom game domain that stays unchanged when the
hosting provider changes. If the origin must change:

1. Before cutover, tell players to open `/migration-assistant.html` on the old URL
   and download a backup. The existing in-game `.prsv` export remains a second
   independent backup.
2. After cutover, open `/migration-assistant.html` on the new URL, validate the
   displayed source origin and checksum, then import.
3. Import skips existing keys by default. Overwrite requires an explicit checkbox.
4. If browser storage fails, the assistant rolls back all keys changed in that
   import attempt.

Backups contain game-related browser storage and must be treated as private user
data. Never request that players post them publicly.

## Cutover

1. Announce a maintenance window and pause production merges.
2. Re-run integrity verification on both hosts.
3. Reduce custom-domain DNS TTL at least 24 hours in advance when applicable.
4. Point the stable domain to the standby provider. Do not change application paths.
5. Verify HTTPS, the release SHA, critical-file hashes, cache headers, and a real
   save/load cycle from an incognito browser.
6. Monitor errors and availability while keeping GitHub Pages intact.

## Rollback

Rollback immediately if the root page, critical assets, save/load, or service
worker verification fails:

1. Restore DNS/routing to GitHub Pages or select the last known-good immutable release.
2. Verify `hosting-release.json` matches the recorded good SHA.
3. Purge only the failed provider cache; do not clear users' browser storage.
4. Reopen production merges only after the incident notes and corrective test exist.

Keep the old host available for at least 30 days after a successful URL-changing
migration so players can export saves. Deletion is a separate, explicitly approved
maintenance action.
