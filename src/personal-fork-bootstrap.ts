/*
 * SPDX-FileCopyrightText: 2026 morvorus
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => undefined);
  });
}

window.addEventListener("beforeinstallprompt", event => {
  // Avoid an invasive prompt. Manual PWA installation remains available.
  event.preventDefault();
});

if (!["localhost", "127.0.0.1"].includes(window.location.hostname)) {
  const notice = document.querySelector<HTMLElement>("#personal-fork-notice");
  const dismissButton = notice?.querySelector<HTMLButtonElement>("button");
  if (notice && dismissButton) {
    notice.style.display = "block";
    dismissButton.addEventListener("click", () => notice.remove());
  }
}
