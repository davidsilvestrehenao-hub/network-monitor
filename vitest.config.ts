import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup-simple.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/e2e/**",
      "**/*.e2e.spec.ts",
      "**/*.e2e.test.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/dist/**",
        "**/coverage/**",
        "**/mocks/**",
        "**/prisma/**",
        "**/seed.ts",
        "**/schema.prisma",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src"),
      "@network-monitor/shared": resolve(__dirname, "./packages/shared/src"),
      "@network-monitor/database": resolve(
        __dirname,
        "./packages/database/src"
      ),
      "@network-monitor/infrastructure": resolve(
        __dirname,
        "./packages/infrastructure/src"
      ),
      "@network-monitor/monitor": resolve(__dirname, "./packages/monitor/src"),
      "@network-monitor/alerting": resolve(
        __dirname,
        "./packages/alerting/src"
      ),
      "@network-monitor/notification": resolve(
        __dirname,
        "./packages/notification/src"
      ),
      "@network-monitor/auth": resolve(__dirname, "./packages/auth/src"),
      "@network-monitor/speed-test": resolve(
        __dirname,
        "./packages/speed-test/src"
      ),
    },
  },
  define: {
    "import.meta.vitest": "undefined",
  },
});
