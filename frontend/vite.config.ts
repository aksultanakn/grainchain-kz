import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    commonjsOptions: { transformMixedEsModules: true },
  },
  define: {
    "process.env": {},
    global: "globalThis",
  },
  resolve: {
    alias: {
      stream: "stream-browserify",
      buffer: "buffer",
    },
  },
  optimizeDeps: {
    include: ["buffer", "bn.js"],
    esbuildOptions: {
      target: "esnext",
      define: { global: "globalThis" },
    },
  },
});
