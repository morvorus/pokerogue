/*
 * SPDX-FileCopyrightText: 2026 morvorus
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const target = process.argv[2];
if (!target) {
  throw new Error("Usage: node scripts/verify-hosting-release.mjs <dist-directory-or-url>");
}

const remote = /^https?:\/\//i.test(target);
const read = async relativePath => {
  if (!remote) {
    return readFile(resolve(target, relativePath));
  }
  const response = await fetch(new URL(relativePath, target.endsWith("/") ? target : `${target}/`), {
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`${relativePath}: HTTP ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
};

const manifest = JSON.parse((await read("hosting-release.json")).toString("utf8"));
if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.criticalFiles) || !Array.isArray(manifest.files)) {
  throw new Error("Unsupported hosting manifest");
}
if (process.env.EXPECTED_RELEASE && manifest.release !== process.env.EXPECTED_RELEASE) {
  throw new Error(`Expected release ${process.env.EXPECTED_RELEASE}, received ${manifest.release}`);
}

const filesByPath = new Map(manifest.files.map(file => [file.path, file]));
const filesToVerify =
  process.env.VERIFY_ALL === "1"
    ? manifest.files
    : manifest.criticalFiles.map(path => {
        const file = filesByPath.get(path);
        if (!file) {
          throw new Error(`Critical file is missing from manifest: ${path}`);
        }
        return file;
      });

let verifiedBytes = 0;
for (const file of filesToVerify) {
  const contents = await read(file.path);
  const digest = createHash("sha256").update(contents).digest("hex");
  if (contents.byteLength !== file.bytes || digest !== file.sha256) {
    throw new Error(`${file.path}: integrity verification failed`);
  }
  verifiedBytes += file.bytes;
}

if (
  process.env.VERIFY_ALL === "1"
  && (filesToVerify.length !== manifest.artifact.fileCount || verifiedBytes !== manifest.artifact.totalBytes)
) {
  throw new Error("Artifact totals do not match the verified inventory");
}

console.log(
  `Hosting release verified: ${manifest.release} (${filesToVerify.length.toLocaleString()} files, ${verifiedBytes.toLocaleString()} bytes)`,
);
