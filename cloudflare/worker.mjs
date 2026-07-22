/*
 * SPDX-FileCopyrightText: 2026 morvorus
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const HTML_FALLBACK = "index.html";
const HASHED_ASSET = /-[A-Za-z0-9_-]{8,}\.(?:css|js)$/;
const RELEASE_ID = /^[0-9a-f]{40}$/;
const PRODUCTION_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self'",
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "img-src 'self' data: blob:",
  "manifest-src 'self'",
  "media-src 'self' blob:",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "worker-src 'self' blob:",
].join("; ");

function objectKey(request, release) {
  const url = new URL(request.url);
  let path;

  try {
    path = decodeURIComponent(url.pathname);
  } catch {
    return null;
  }

  const segments = path.split("/").filter(Boolean);
  if (segments.some(segment => segment === "." || segment === "..")) {
    return null;
  }

  const file = segments.join("/") || HTML_FALLBACK;
  return `releases/${release}/${file}`;
}

function responseHeaders(object, file) {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("x-frame-options", "SAMEORIGIN");
  headers.set("cross-origin-resource-policy", "same-origin");
  headers.set("permissions-policy", "camera=(), geolocation=(), microphone=(), payment=(), usb=()");
  headers.set("x-permitted-cross-domain-policies", "none");
  headers.set("strict-transport-security", "max-age=31536000");

  if (file === "migration-assistant.html") {
    headers.set(
      "content-security-policy",
      "default-src 'none'; base-uri 'none'; form-action 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'",
    );
  } else {
    headers.set("content-security-policy", PRODUCTION_CSP);
  }

  if (file === HTML_FALLBACK || file.endsWith("service-worker.js") || file.endsWith("manifest.webmanifest")) {
    headers.set("cache-control", "public, max-age=0, must-revalidate");
  } else if (HASHED_ASSET.test(file)) {
    headers.set("cache-control", "public, max-age=31536000, immutable");
  } else {
    headers.set("cache-control", "public, max-age=2592000, stale-while-revalidate=86400");
  }

  return headers;
}

async function getObject(env, key) {
  return env.GAME_FILES.get(key, { onlyIf: {} });
}

// biome-ignore lint/style/noDefaultExport: Cloudflare Workers require the module handler as the default export.
export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { allow: "GET, HEAD" } });
    }

    if (!RELEASE_ID.test(env.CURRENT_RELEASE)) {
      return new Response("Release unavailable", { status: 503 });
    }

    const key = objectKey(request, env.CURRENT_RELEASE);
    if (!key) {
      return new Response("Bad Request", { status: 400 });
    }

    let object = await getObject(env, key);
    let file = key.slice(key.lastIndexOf("/") + 1);

    if (!object && request.headers.get("accept")?.includes("text/html")) {
      const fallbackKey = `releases/${env.CURRENT_RELEASE}/${HTML_FALLBACK}`;
      object = await getObject(env, fallbackKey);
      file = HTML_FALLBACK;
    }

    if (!object) {
      return new Response("Not Found", { status: 404 });
    }

    return new Response(request.method === "HEAD" ? null : object.body, {
      status: 200,
      headers: responseHeaders(object, file),
    });
  },
};
