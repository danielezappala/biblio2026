#!/usr/bin/env bash
set -euo pipefail

ports=(5173 4173 5000 4000 8080 9099 4400)

killed=0
for port in "${ports[@]}"; do
  pids=$(lsof -ti tcp:"$port" || true)
  if [ -n "$pids" ]; then
    echo "Stopping processes on port $port: $pids"
    kill -9 $pids
    killed=1
  fi
done

if [ "$killed" -eq 0 ]; then
  echo "No dev processes found on common ports."
fi
