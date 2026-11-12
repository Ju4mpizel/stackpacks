import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      // "server-only" lanza fuera de React Server Components; en tests lo neutralizamos.
      "server-only": fileURLToPath(new URL("./lib/test/empty.js", import.meta.url)),
    },
  },
  test: {
    include: ["lib/**/*.test.js", "scripts/**/*.test.js"],
    environment: "node",
  },
});
