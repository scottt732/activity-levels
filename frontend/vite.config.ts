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
    rollupOptions: { output: { chunkFileNames: "shared-[hash].js" } },
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
