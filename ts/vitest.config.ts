import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@approval-surface/core": fileURLToPath(
        new URL("packages/core/src/index.ts", import.meta.url),
      ),
      "@approval-surface/local": fileURLToPath(
        new URL("packages/local/src/index.ts", import.meta.url),
      ),
    },
  },
});
