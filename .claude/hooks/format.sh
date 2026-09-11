#!/bin/bash

repo_root="$(cd "$(dirname "$0")/../.." && pwd -P)" || exit 1
exec node "$repo_root/scripts/agent-hooks/format.mjs"
