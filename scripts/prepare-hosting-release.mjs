/*
 * SPDX-FileCopyrightText: 2026 morvorus
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = resolve(process.argv[2] ?? "dist");
const assistantSource = resolve(repositoryRoot, "hosting/migration-assistant.html");
const assistantTarget = resolve(outputRoot, "migration-assistant.html");
const productionCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self'",
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-src 'none'",
  "img-src 'self' data: blob:",
  "manifest-src 'self'",
  "media-src 'self' blob:",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "worker-src 'self' blob:",
].join("; ");

await copyFile(assistantSource, assistantTarget);

// Keep the installed PWA inside the current hosting path. Absolute root paths
// would leave a GitHub Pages project site and make a provider move inconsistent.
const webManifestPath = resolve(outputRoot, "manifest.webmanifest");
const webManifest = JSON.parse(await readFile(webManifestPath, "utf8"));
webManifest.scope = "./";
webManifest.start_url = "./";
webManifest.icons = webManifest.icons?.map(icon => ({ ...icon, src: icon.src.replace(/^\//, "") }));
await writeFile(webManifestPath, `${JSON.stringify(webManifest, null, 2)}\n`, "utf8");

const indexPath = resolve(outputRoot, "index.html");
let indexHtml = await readFile(indexPath, "utf8");
indexHtml = indexHtml.replace(
  /<head>/i,
  `<head>\n  <meta http-equiv="Content-Security-Policy" content="${productionCsp}">`,
);

const assetTags = [...indexHtml.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="(\.\/assets\/[^"]+)"[^>]*>/gi)];
for (const match of assetTags.reverse()) {
  if (match[0].includes(" integrity=")) {
    continue;
  }
  const contents = await readFile(resolve(outputRoot, match[1].slice(2)));
  const integrity = createHash("sha384").update(contents).digest("base64");
  const hardenedTag = match[0].replace(/>$/, ` integrity="sha384-${integrity}">`);
  indexHtml = `${indexHtml.slice(0, match.index)}${hardenedTag}${indexHtml.slice(match.index + match[0].length)}`;
}
await writeFile(indexPath, indexHtml, "utf8");

async function listFiles(directory, prefix = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...(await listFiles(path, relativePath)));
    } else if (entry.isFile() && entry.name !== "hosting-release.json") {
      files.push(relativePath);
    }
  }
  return files;
}

async function describe(relativePath) {
  const path = resolve(outputRoot, relativePath);
  const contents = await readFile(path);
  return {
    path: relativePath,
    bytes: contents.byteLength,
    sha256: createHash("sha256").update(contents).digest("hex"),
  };
}

const release =
  process.env.GITHUB_SHA
  ?? execFileSync("git", ["rev-parse", "HEAD"], { cwd: repositoryRoot, encoding: "utf8" }).trim();
const committedAt = execFileSync("git", ["show", "-s", "--format=%cI", release], {
  cwd: repositoryRoot,
  encoding: "utf8",
}).trim();
const paths = (await listFiles(outputRoot)).sort();
const files = [];
const batchSize = 32;
for (let offset = 0; offset < paths.length; offset += batchSize) {
  files.push(...(await Promise.all(paths.slice(offset, offset + batchSize).map(describe))));
}
const artifact = { fileCount: files.length, totalBytes: files.reduce((total, file) => total + file.bytes, 0) };
const criticalFiles = ["index.html", "service-worker.js", "manifest.webmanifest", "migration-assistant.html"];
const manifest = { schemaVersion: 1, release, committedAt, artifact, criticalFiles, files };

await writeFile(resolve(outputRoot, "hosting-release.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(
  `Prepared hosting release ${release}: ${artifact.fileCount.toLocaleString()} files, ${artifact.totalBytes.toLocaleString()} bytes`,
);
