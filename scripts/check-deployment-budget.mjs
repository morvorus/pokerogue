/*
 * SPDX-FileCopyrightText: 2026 morvorus
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(process.argv[2] ?? "dist");
const maxBytes = Number(process.env.MAX_DEPLOYMENT_BYTES ?? 900 * 1024 * 1024);
const maxFiles = Number(process.env.MAX_DEPLOYMENT_FILES ?? 100_000);

async function measure(directory) {
  let bytes = 0;
  let files = 0;

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      const child = await measure(path);
      bytes += child.bytes;
      files += child.files;
    } else if (entry.isFile()) {
      bytes += (await stat(path)).size;
      files += 1;
    }
  }

  return { bytes, files };
}

const result = await measure(root);
console.log(`Deployment artifact: ${result.files.toLocaleString()} files, ${result.bytes.toLocaleString()} bytes`);
console.log(`Budget: ${maxFiles.toLocaleString()} files, ${maxBytes.toLocaleString()} bytes`);

if (result.files > maxFiles || result.bytes > maxBytes) {
  console.error("Deployment artifact exceeds its configured budget.");
  process.exitCode = 1;
}
