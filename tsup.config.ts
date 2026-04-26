import { defineConfig } from "tsup"

// Two entry points:
//   - `index` — server-safe (types, utils, theme presets)
//   - `client` — React components (marked "use client" via post-build prepend)
// Splitting these lets Server Components import types/utils/presets without
// crossing a client boundary, while Client Components get the JSX from the
// client entry. tsup/esbuild strips per-file "use client" directives on
// bundle, so the prepend step in scripts/prepend-use-client.mjs re-stamps it.
export default defineConfig({
  entry: { index: "src/index.ts", client: "src/client.ts" },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "next", "next/image"],
  treeshake: true,
})
