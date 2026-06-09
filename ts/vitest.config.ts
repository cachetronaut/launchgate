import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@launchgate/core": fileURLToPath(new URL("packages/core/src/index.ts", import.meta.url)),
      "@launchgate/local": fileURLToPath(new URL("packages/local/src/index.ts", import.meta.url)),
    },
  },
});
