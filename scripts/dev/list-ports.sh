#!/usr/bin/env bash
set -euo pipefail

ports=(5173 4173 5000 4000 8080 9099 4400)

found=0
for port in "${ports[@]}"; do
  if lsof -ti tcp:"$port" >/dev/null 2>&1; then
    echo "Port $port:"
    lsof -nP -iTCP:"$port" -sTCP:LISTEN
    found=1
  fi
done

if [ "$found" -eq 0 ]; then
  echo "No dev processes found on common ports."
fi
