/*
 * SPDX-FileCopyrightText: 2026 morvorus
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const errors = [];

async function listYamlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listYamlFiles(path)));
    } else if (entry.isFile() && /\.ya?ml$/i.test(entry.name)) {
      files.push(path);
    }
  }
  return files;
}

const files = [
  ...(await listYamlFiles(resolve(".github/workflows"))),
  ...(await listYamlFiles(resolve(".github/actions"))),
];

for (const file of files) {
  const contents = await readFile(file, "utf8");
  for (const [lineIndex, line] of contents.split(/\r?\n/).entries()) {
    const action = line.match(/^\s*-?\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/)?.[1];
    if (!action || action.startsWith("./")) {
      continue;
    }

    const separator = action.lastIndexOf("@");
    const reference = separator >= 0 ? action.slice(separator + 1) : "";
    if (!/^[0-9a-f]{40}$/i.test(reference)) {
      errors.push(`${file}:${lineIndex + 1} must pin ${action} to a full commit SHA`);
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`::error::${error}`);
  }
  process.exitCode = 1;
} else {
  console.log("All external GitHub Actions are pinned to immutable commit SHAs.");
}
