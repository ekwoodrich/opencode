#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

required_bun_version="1.3.5"

if ! command -v bun >/dev/null 2>&1; then
  echo "bun ${required_bun_version} is required but not found; installing..." >&2
  curl -fsSL https://bun.sh/install | bash -s "bun-v${required_bun_version}"
  if [ -d "$HOME/.bun/bin" ]; then
    export PATH="$HOME/.bun/bin:$PATH"
  fi
fi

if command -v bun >/dev/null 2>&1; then
  current_bun_version="$(bun --version || true)"
  if [ "$current_bun_version" != "$required_bun_version" ]; then
    echo "bun ${required_bun_version} is required (found ${current_bun_version}); installing required version..." >&2
    curl -fsSL https://bun.sh/install | bash -s "bun-v${required_bun_version}"
    if [ -d "$HOME/.bun/bin" ]; then
      export PATH="$HOME/.bun/bin:$PATH"
    fi
  fi
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "bun install failed or PATH not updated; try restarting your shell" >&2
  exit 1
fi

cd "$repo_root"

bun install
./packages/opencode/script/build.ts --single

echo "Build complete. Binary: $repo_root/packages/opencode/dist/opencode-linux-x64/bin/opencode"
