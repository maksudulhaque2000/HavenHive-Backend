const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = [
  {
    ignores: ["dist/**", "node_modules/**"],
    languageOptions: {
      globals: {
        require: "readonly",
        module: "readonly",
        process: "readonly",
        __dirname: "readonly",
        console: "readonly",
      },
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
    },
  },
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {},
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
