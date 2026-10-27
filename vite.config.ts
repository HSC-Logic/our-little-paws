import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    react(),
    tailwind(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      filename: "sw.js",
      includeAssets: [
        "favicon.svg",
        "favicon-32.png",
        "apple-touch-icon.png",
        "icons/*.png",
        "art/*.webp",
        "audio/*.wav",
        "audio/*.opus",
      ],
      manifest: {
        id: "./",
        name: "Our Little Paws & Melodies",
        short_name: "Little Paws",
        description: "A tiny world of paws, music, and little moments for two.",
        lang: "en",
        start_url: "./#/",
        scope: "./",
        display: "standalone",
        orientation: "any",
        theme_color: "#aa83d7",
        background_color: "#faf4ff",
        categories: ["games", "lifestyle", "music"],
        prefer_related_applications: false,
        icons: [
          {
            src: "icons/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/pwa-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Our home",
            url: "./#/",
            icons: [
              { src: "icons/pwa-192.png", sizes: "192x192", type: "image/png" },
            ],
          },
          { name: "Music room", url: "./#/music" },
          { name: "Love letters", url: "./#/mail" },
        ],
      },
      workbox: {
        globPatterns: [
          "**/*.{html,js,css,svg,png,webp,wav,opus,woff2,webmanifest}",
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: true,
        navigateFallback: "index.html",
        runtimeCaching: [],
        importScripts: ["pwa-cleanup.js"],
      },
      devOptions: { enabled: false },
    }),
  ],
  base: process.env.VITE_BASE_PATH || "/",
  test: {
    env: { VITE_SUPABASE_URL: "", VITE_SUPABASE_PUBLISHABLE_KEY: "" },
    exclude: ["tests/**", "node_modules/**"],
    environment: "jsdom",
    setupFiles: "./src/test-setup.ts",
  },
});
