import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid({ ssr: true })],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    target: "esnext",
    minify: false,
  },
  ssr: {
    external: ["@prisma/client"],
  },
});
