#!/bin/sh
set -eu

repo_root="$(CDPATH='' cd -- "$(dirname "$0")/.." && pwd)"
hooks_dir="$repo_root/.githooks"

if [ ! -d "$hooks_dir" ]; then
  echo "Missing hooks directory: $hooks_dir" >&2
  exit 1
fi

git -C "$repo_root" config core.hooksPath "$hooks_dir"
chmod +x "$hooks_dir"/pre-commit "$hooks_dir"/pre-push

echo "Installed git hooks from $hooks_dir"
echo "core.hooksPath=$(git -C "$repo_root" config core.hooksPath)"
