/*
 * SPDX-FileCopyrightText: 2026 morvorus
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(process.argv[2] ?? "dist");
const errors = [];

async function listFiles(directory, prefix = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...(await listFiles(path, relativePath)));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }
  return files;
}

const files = await listFiles(root);
const indexHtml = await readFile(resolve(root, "index.html"), "utf8");
const csp = indexHtml.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/i)?.[1];

if (!csp?.includes("object-src 'none'") || !csp.includes("script-src 'self'")) {
  errors.push("index.html is missing the required production Content Security Policy");
}

for (const script of indexHtml.matchAll(/<script\b([^>]*)>/gi)) {
  if (!/\bsrc="[^"]+"/i.test(script[1])) {
    errors.push("index.html contains inline JavaScript");
  } else if (!/\bintegrity="sha384-[A-Za-z0-9+/=]+"/i.test(script[1])) {
    errors.push("index.html contains a script without SHA-384 Subresource Integrity");
  }
}

for (const link of indexHtml.matchAll(/<link\b([^>]*(?:modulepreload|stylesheet)[^>]*)>/gi)) {
  if (!/\bintegrity="sha384-[A-Za-z0-9+/=]+"/i.test(link[1])) {
    errors.push("index.html contains a preload or stylesheet without SHA-384 Subresource Integrity");
  }
}

const forbiddenFile = /(?:^|\/)(?:\.env(?:\..+)?|[^/]+\.(?:key|pem|p12|pfx|map))$/i;
for (const file of files) {
  if (forbiddenFile.test(file)) {
    errors.push(`Forbidden production file: ${file}`);
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`::error::${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Production security gate passed for ${files.length.toLocaleString()} files.`);
}
