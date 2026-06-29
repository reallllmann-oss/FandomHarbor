import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const setupFile = fileURLToPath(new URL("./vitest.setup.ts", import.meta.url));

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "html"],
    },
    environment: "jsdom",
    include: [
      "src/**/*.test.{ts,tsx}",
      "apps/**/*.test.{ts,tsx}",
      "packages/**/*.test.{ts,tsx}",
    ],
    setupFiles: [setupFile],
  },
});
