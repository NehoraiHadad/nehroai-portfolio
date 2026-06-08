// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// Static output (default) — a flat file tree perfect for Cloudflare Pages.
// React is added so the "heart" (CharacterVideo) ships as a single client island.
// Phase 2: that same island becomes the react-three-fiber <Canvas>; nothing else here changes.
export default defineConfig({
  site: "https://nehoraihadad.com",
  integrations: [react()],
  // Keep assets predictable for the video-swap workflow and Cloudflare caching.
  build: {
    assets: "_assets",
  },
});
