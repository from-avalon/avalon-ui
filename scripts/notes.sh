#!/bin/bash
# notes.sh <version>: prints that release's section of CHANGELOG.md, for the GitHub release
set -euo pipefail
cd "$(dirname "$0")/.."
v="${1:?version, as in 0.4.0}"
out="$(awk -v v="$v" '/^## / { on = index($0, "## " v " ") == 1; next } on' CHANGELOG.md)"
[ -n "$(echo "$out" | tr -d '[:space:]')" ] || { echo "no section for $v in CHANGELOG.md" >&2; exit 1; }
echo "$out" | sed -e '/./,$!d'
