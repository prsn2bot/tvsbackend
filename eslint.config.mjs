import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";


export default defineConfig([
  // Global configuration for all files
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: Object.fromEntries(Object.entries(globals.browser).map(([key, value]) => [key.trim(), value])),
    },
    extends: [js.configs.recommended],
    plugins: {
      react: pluginReact,
    },
  },
  // Configuration for TypeScript files
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Add TypeScript specific rules here if needed
    }
  },
  // Configuration for JavaScript files that might have specific needs (e.g., Jest)
  {
    files: ["jest.config.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        module: true,
      },
    },
    rules: {
      'no-undef': 'off',
    },
  },
  {
    files: ["scripts/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        require: true,
        __dirname: true,
        process: true,
        console: true,
      },
    },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]);
