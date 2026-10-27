import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwind()],
  base: process.env.VITE_BASE_PATH || "/",
  test: {
    env: { VITE_SUPABASE_URL: "", VITE_SUPABASE_PUBLISHABLE_KEY: "" },
    exclude: ["tests/**", "node_modules/**"],
    environment: "jsdom",
    setupFiles: "./src/test-setup.ts",
  },
});
