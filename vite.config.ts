import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  root: "src",
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
