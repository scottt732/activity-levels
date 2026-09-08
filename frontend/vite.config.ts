import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    lib: {
      entry: {
        "activity-levels-panel": "src/main.ts",
        "activity-levels-cards": "src/cards.ts",
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    outDir: "../custom_components/activity_levels/frontend",
    emptyOutDir: true,
    target: "es2022",
    minify: true,
    sourcemap: false,
    rollupOptions: { output: {
      chunkFileNames: "shared-[hash].js",
      // Both chunks remain behind the viewer's dynamic import. Keeping Three's core
      // separate also keeps each committed artifact below the repository's 512 KB limit.
      manualChunks(id) {
        if (id.includes("/three/build/three.core.js")) return "three-core";
        if (id.includes("/three/build/three.module.js")) return "three-renderer";
      },
    } },
  },
  server: { port: 5173, cors: true, strictPort: true },
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**"],
    },
  },
});
