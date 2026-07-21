import js from "@eslint/js";
import tsEslint from "typescript-eslint";

export default tsEslint.config(
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  }
);
