import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  ssr: false, // Disable SSR to avoid client-only API errors
  server: {
    preset: "bun",
  },
  vite: {
    ssr: {
      external: [
        "@prisma/client",
        "fs",
        "path",
        "os",
        "util",
        "zlib",
        "http",
        "https",
        "child_process",
        "node:async_hooks",
      ],
    },
    build: {
      rollupOptions: {
        external: [
          "node:async_hooks",
          "fs",
          "path",
          "os",
          "util",
          "zlib",
          "http",
          "https",
          "child_process",
        ],
      },
    },
  },
});
