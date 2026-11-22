import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves the site from https://windmolders.github.io/3D-warmsteweek-2026/
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/3D-warmsteweek-2026/" : "/",
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1500 },
}));
