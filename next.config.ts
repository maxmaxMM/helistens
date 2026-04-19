import type { NextConfig } from "next";

/**
 * No PWA / service worker / web app manifest in this repo (no next-pwa, serwist, etc.).
 * During `next dev`, `app/DevServiceWorkerCleanup.tsx` unregisters any orphan SWs and
 * clears Cache Storage so mobile/LAN tests are not stuck on old JS from another deploy.
 */

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.141"],
};

export default nextConfig;