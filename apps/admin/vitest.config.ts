import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const setupFile = fileURLToPath(
  new URL("../../vitest.setup.ts", import.meta.url),
);

export default defineConfig({
  oxc: {
    jsx: {
      runtime: "automatic",
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: [setupFile],
  },
});
