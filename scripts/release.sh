#!/bin/bash
# release.sh: tags a release that npm and pnpm can install straight from git, with no registry
# and no token: "@severian-dev/avalon-ui": "github:from-avalon/avalon-ui#v<version>".
# dist/ stays out of the branch; the tag points at a commit just off it that carries the build.
#   1. set "version" in package.json and commit it   2. scripts/release.sh   3. git push origin v<version>
set -euo pipefail
cd "$(dirname "$0")/.."
v="$(node -p "require('./package.json').version")"
git diff --quiet && git diff --cached --quiet || { echo "commit your changes first" >&2; exit 1; }
! git rev-parse -q --verify "refs/tags/v$v" >/dev/null || { echo "v$v is already tagged: bump the version" >&2; exit 1; }
branch="$(git symbolic-ref --short HEAD)"
npm ci
npm run build
git checkout -q --detach
git add -f dist
git commit -q -m "release v$v: the built dist, for installing from git"
git tag -a "v$v" -m "@severian-dev/avalon-ui v$v"
git checkout -q "$branch"
echo "tagged v$v; publish it with: git push origin v$v"
