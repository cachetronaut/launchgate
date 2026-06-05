import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "packages/core/src/index.ts",
    local: "packages/local/src/index.ts",
  },
  format: "esm",
  dts: true,
  splitting: true,
  clean: true,
  outDir: "dist",
  target: "es2022",
});
