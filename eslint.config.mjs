import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

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
  ]),
  {
    // Allow the standard underscore-prefix convention for
    // intentionally-unused bindings (e.g. destructuring to discard a
    // key, or a reducer parameter that's referenced only by name).
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
  // The demo is independently extractable: it must never reach back into
  // the site or app.
  {
    files: ["src/demo/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/site", "@/site/**", "@/app", "@/app/**"],
              message:
                "demo/ must stay independent of the site — it's extracted to its own package.",
            },
          ],
        },
      ],
    },
  },
  // The site consumes the demo only through its public barrel (@/demo),
  // never its internals.
  {
    files: ["src/site/**/*.{ts,tsx}", "src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/demo/**"],
              message: "Import the demo through its public barrel: @/demo.",
            },
          ],
        },
      ],
    },
  },
  // Disable ESLint rules that would conflict with Prettier. Must come
  // last so it overrides any formatting-related rules above.
  prettier,
]);

export default eslintConfig;
