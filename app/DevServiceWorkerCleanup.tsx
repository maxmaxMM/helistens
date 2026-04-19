"use client";

import { useEffect } from "react";

/**
 * Dev-only: unregisters any service workers and clears Cache Storage so LAN / mobile
 * testing does not keep stale bundles from an old build or another app on the same origin.
 * This project does not register a SW in source; this only cleans up leftovers.
 */
export default function DevServiceWorkerCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    void (async () => {
      try {
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const reg of regs) {
            console.info("[helistens dev] unregister service worker:", reg.scope);
            await reg.unregister();
          }
        }
      } catch (e) {
        console.warn("[helistens dev] service worker unregister failed", e);
      }

      try {
        if ("caches" in window) {
          const keys = await caches.keys();
          for (const key of keys) {
            console.info("[helistens dev] delete cache:", key);
            await caches.delete(key);
          }
        }
      } catch (e) {
        console.warn("[helistens dev] cache delete failed", e);
      }
    })();
  }, []);

  return null;
}
