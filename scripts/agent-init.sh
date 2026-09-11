#!/bin/bash

set -euo pipefail

if [ "$#" -ne 0 ]; then
  echo "Usage: ./scripts/agent-init.sh" >&2
  exit 1
fi

get_default_app_url() {
  if [ "${PORTLESS:-}" = "0" ]; then
    echo "http://localhost:${PORT:-3000}"
    return
  fi

  local branch branch_label

  branch="$(git branch --show-current 2>/dev/null || true)"

  if [ -n "$branch" ] && [ "$branch" != "master" ] && [ "$branch" != "main" ]; then
    branch_label="$(
      printf '%s' "$branch" \
        | tr '[:upper:]' '[:lower:]' \
        | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g'
    )"

    if [ -n "$branch_label" ]; then
      echo "https://${branch_label}.seedit.localhost"
      return
    fi
  fi

  echo "https://seedit.localhost"
}

app_url="${AGENT_APP_URL:-$(get_default_app_url)}"
repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

echo "Repo root: $repo_root"
echo "App URL: $app_url"

if ! curl --max-time 10 -fsSk "$app_url" >/dev/null; then
  echo "No reachable task server. Start yarn start in an owned terminal, record its process/session, then rerun with AGENT_APP_URL set to its URL." >&2
  exit 1
fi

echo "Dev server is ready."
