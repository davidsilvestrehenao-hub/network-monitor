import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import solid from "eslint-plugin-solid";

export default [
  js.configs.recommended,
  {
    files: [
      "src/**/*.{ts,tsx}",
      "packages/**/src/**/*.{ts,tsx}",
      "apps/**/src/**/*.{ts,tsx}",
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        alert: "readonly",
        confirm: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
        performance: "readonly",
        // Node.js globals
        process: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        NodeJS: "readonly",
        global: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      solid: solid,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...solid.configs.typescript.rules,
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",
      "no-undef": "off", // TypeScript handles this
    },
  },
  {
    files: [
      "prisma/**/*.ts",
      "scripts/**/*.ts",
      "packages/**/prisma/**/*.ts",
      "packages/**/scripts/**/*.ts",
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        NodeJS: "readonly",
        global: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "no-console": "off", // Allow console in scripts
      "no-undef": "off",
    },
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        NodeJS: "readonly",
        global: "readonly",
      },
    },
    rules: {
      "no-console": "off", // Allow console in JS files
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".output/**",
      ".vinxi/**",
      "prisma/migrations/**",
      "packages/**/node_modules/**",
      "packages/**/dist/**",
      "apps/**/node_modules/**",
      "apps/**/dist/**",
      "**/*.d.ts",
      "public/sw.js",
      "app.config.ts",
      "postcss.config.js",
      "tailwind.config.js",
      "eslint.config.js",
    ],
  },
];
