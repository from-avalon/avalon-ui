#!/bin/bash
# release.sh: tags a release that npm and pnpm can install straight from git, with no registry
# and no token: "@severian-dev/avalon-ui": "github:from-avalon/avalon-ui#v<version>".
# dist/ stays out of the branch; the tag points at a commit just off it that carries the build.
#   1. set "version" in package.json and write its dated CHANGELOG.md section   2. get that commit onto main
#   3. scripts/release.sh, from main's tip   4. git push origin v<version>   5. gh release create, with scripts/notes.sh
set -euo pipefail
cd "$(dirname "$0")/.."
v="$(node -p "require('./package.json').version")"
git diff --quiet && git diff --cached --quiet || { echo "commit your changes first" >&2; exit 1; }
! git rev-parse -q --verify "refs/tags/v$v" >/dev/null || { echo "v$v is already tagged: bump the version" >&2; exit 1; }
start="$(git symbolic-ref -q --short HEAD || git rev-parse HEAD)"
git fetch -q origin main
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] || { echo "releases are cut from main: get this commit onto main first" >&2; exit 1; }
grep -q "^## $v ([0-9]" CHANGELOG.md || { echo "CHANGELOG.md needs a dated section for $v" >&2; exit 1; }
npm ci
npm run build
git checkout -q --detach
git add -f dist
git commit -q -m "release v$v: the built dist, for installing from git"
git tag -a "v$v" -m "@severian-dev/avalon-ui v$v"
git checkout -q "$start"
echo "tagged v$v; publish it with: git push origin v$v, then gh release create v$v --title v$v --notes \"\$(scripts/notes.sh $v)\""
