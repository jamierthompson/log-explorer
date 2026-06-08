/*
 * PostCSS configuration.
 *
 * - @csstools/postcss-global-data injects each domain's @custom-media
 *   rules into every CSS file before later plugins run. Without this,
 *   postcss-custom-media would only see declarations inside the file it's
 *   processing — and every CSS Module is its own file.
 * - postcss-custom-media compiles `@custom-media --name (...)` and
 *   rewrites `@media (--name)` references in the same pass.
 */
const config = {
  plugins: {
    "@csstools/postcss-global-data": {
      files: ["src/demo/styles/custom-media.css", "src/app/custom-media.css"],
    },
    "postcss-custom-media": {},
  },
};

export default config;
