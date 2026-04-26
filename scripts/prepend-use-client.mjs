// Prepend "use client" to the CLIENT bundle only (dist/client.{js,cjs}).
// The server entry (dist/index.{js,cjs}) ships server-safe utilities/types
// and must not be marked client.
//
// tsup/esbuild strips per-file "use client" directives during bundle, and the
// `banner` option doesn't survive ESM import reordering, so we do this as an
// explicit post-build step.

import { readFile, writeFile } from "node:fs/promises"

const DIRECTIVE = '"use client";\n'
const TARGETS = ["dist/client.js", "dist/client.cjs"]

for (const path of TARGETS) {
  const original = await readFile(path, "utf8")
  if (original.startsWith('"use client"')) continue
  await writeFile(path, DIRECTIVE + original, "utf8")
}
