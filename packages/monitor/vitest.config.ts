import { defineConfig } from "vitest/config";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    // setupFiles: ["../shared/src/test-utils/setup-simple.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/e2e/**",
      "**/*.e2e.spec.ts",
      "**/*.e2e.test.ts",
    ],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "@network-monitor/shared": resolve(__dirname, "../shared/src"),
      "@network-monitor/database": resolve(__dirname, "../database/src"),
      "@network-monitor/infrastructure": resolve(
        __dirname,
        "../infrastructure/src"
      ),
      "@network-monitor/monitor": resolve(__dirname, "./src"),
      "@network-monitor/alerting": resolve(__dirname, "../alerting/src"),
      "@network-monitor/notification": resolve(
        __dirname,
        "../notification/src"
      ),
      "@network-monitor/auth": resolve(__dirname, "../auth/src"),
      "@network-monitor/speed-test": resolve(__dirname, "../speed-test/src"),
    },
  },
  define: {
    "import.meta.vitest": "undefined",
  },
});
