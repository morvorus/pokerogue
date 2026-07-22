<!--
SPDX-FileCopyrightText: 2026 morvorus

SPDX-License-Identifier: CC-BY-NC-SA-4.0
-->

# Cloudflare R2 deployment

## Purpose

GitHub Pages remains the primary host while the artifact is below its supported
1 GB limit. Cloudflare R2 plus a Worker is the overflow and disaster-recovery
target. The current artifact has more than 34,000 files, so Cloudflare Pages and
Workers Static Assets Free are not suitable because they accept only 20,000 files.

R2 stores immutable releases under `releases/<git-sha>/`. The Worker serves one
release selected by `CURRENT_RELEASE`; changing this variable makes deployment or
rollback atomic without deleting the previous release.

## Required Cloudflare resources

- R2 bucket: `morvorus-pokerogue`
- Worker: `morvorus-pokerogue`
- R2 API token scoped to the bucket
- Cloudflare API token scoped to Workers Scripts Edit

## GitHub configuration

Store credentials only as Actions secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`

Set repository variables:

- `CLOUDFLARE_R2_ENABLED=true`
- `CLOUDFLARE_WORKER_URL=https://morvorus-pokerogue.<account-subdomain>.workers.dev`

Never paste these credentials into an issue, commit, workflow log, or chat.

## Deployment sequence

1. Build with login bypassed and the official API disabled.
2. Enforce the 8 GB/100,000-file R2 artifact budget.
3. Upload the new release under its Git commit SHA.
4. Deploy the Worker with `CURRENT_RELEASE` pointing at the new SHA.
5. Smoke-test the public URL for the game container and fork disclaimer.

Merges to `beta` deploy automatically only after `CLOUDFLARE_R2_ENABLED` is set.

## Rollback

Find the last known-good commit and redeploy the Worker without re-uploading
files:

```powershell
cd cloudflare
pnpm dlx wrangler@4.112.0 deploy --var CURRENT_RELEASE:<known-good-commit-sha>
```

Verify the root URL after rollback. Do not delete a release until a newer release
has been verified and the retention window has expired.

## Retention

Each release currently consumes about 671 MB. Keep at most ten verified releases
under the 10 GB free storage allowance. Cleanup is a deliberate maintenance task,
not part of the deployment transaction, so a failed release cannot erase the
rollback target.
