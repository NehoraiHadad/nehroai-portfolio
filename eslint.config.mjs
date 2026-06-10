import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The landing/ directory is a separate Astro/Workers project with its own
    // toolchain — exclude its generated dist/, .astro/, .wrangler/ artifacts
    // so they don't pollute the portfolio's lint run.
    "landing/**",
  ]),
]);

export default eslintConfig;
