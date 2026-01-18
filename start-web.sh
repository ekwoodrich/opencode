#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v bun >/dev/null 2>&1; then
  echo "bun is required but not found; installing..." >&2
  curl -fsSL https://bun.sh/install | bash
  if [ -d "$HOME/.bun/bin" ]; then
    export PATH="$HOME/.bun/bin:$PATH"
  fi
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "bun install failed or PATH not updated; try restarting your shell" >&2
  exit 1
fi

cd "$repo_root"

bun install
bun run --cwd packages/opencode --conditions=browser src/index.ts web --hostname 0.0.0.0 --port 5556
