import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import solid from "eslint-plugin-solid";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Node.js globals
        console: "readonly",
        process: "readonly",
        global: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        location: "readonly",
        // Auth.js types
        DefaultSession: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      solid: solid,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...solid.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "solid/reactivity": "error",
      "solid/no-destructure": "error",
      "solid/no-array-handlers": "error",
      "solid/no-innerhtml": "error",
      "solid/jsx-no-script-url": "error",
      "solid/jsx-no-undef": "error",
      "solid/jsx-uses-vars": "error",
      "solid/no-unknown-namespaces": "error",
      "solid/self-closing-comp": "error",
      "solid/style-prop": "error",
      // Allow console in scripts and development
      "no-console": "off",
      "no-undef": "off", // TypeScript handles this
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
        global: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".vinxi/**",
      ".output/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.cjs",
    ],
  },
];
