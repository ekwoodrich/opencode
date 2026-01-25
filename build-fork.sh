#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

system_oc_services=()
user_oc_services=()

if command -v systemctl >/dev/null 2>&1; then
  while IFS= read -r unit; do
    [ -n "$unit" ] && system_oc_services+=("$unit")
  done < <(systemctl list-units --type=service --state=active "oc-service-*" --no-legend --no-pager 2>/dev/null | awk '{print $1}' || true)

  while IFS= read -r unit; do
    [ -n "$unit" ] && user_oc_services+=("$unit")
  done < <(systemctl --user list-units --type=service --state=active "oc-service-*" --no-legend --no-pager 2>/dev/null | awk '{print $1}' || true)
fi

restart_oc_services() {
  if [ "${#system_oc_services[@]}" -gt 0 ]; then
    echo "Restarting oc services: ${system_oc_services[*]}"
    for unit in "${system_oc_services[@]}"; do
      systemctl start "$unit"
    done
  fi

  if [ "${#user_oc_services[@]}" -gt 0 ]; then
    echo "Restarting oc user services: ${user_oc_services[*]}"
    for unit in "${user_oc_services[@]}"; do
      systemctl --user start "$unit"
    done
  fi
}

if [ "${#system_oc_services[@]}" -gt 0 ] || [ "${#user_oc_services[@]}" -gt 0 ]; then
  if [ "${#system_oc_services[@]}" -gt 0 ]; then
    echo "Stopping oc services: ${system_oc_services[*]}"
    for unit in "${system_oc_services[@]}"; do
      systemctl stop "$unit"
    done
  fi

  if [ "${#user_oc_services[@]}" -gt 0 ]; then
    echo "Stopping oc user services: ${user_oc_services[*]}"
    for unit in "${user_oc_services[@]}"; do
      systemctl --user stop "$unit"
    done
  fi

  trap restart_oc_services EXIT
fi

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
