import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  resolve: {
    extensions: [".ts"],
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
  },
  server: {
    port: 2011,
    allowedHosts: true,
  },
});
