#!/bin/bash

# This script monitors the backend and toggles Cloudflare Maintenance Mode
# if the backend becomes unreachable.

BACKEND_URL="http://backend:8080/health" # Or any public endpoint
MAINTENANCE_SCRIPT="/app/maintenance-mode.sh"
CHECK_INTERVAL=30
MAX_RETRIES=3

echo "[MONITOR] Starting health monitor for $BACKEND_URL..."

while true; do
    SUCCESS_COUNT=0
    for i in $(seq 1 $MAX_RETRIES); do
        # Check if backend returns 200 OK
        if curl -s --head --fail "$BACKEND_URL" > /dev/null; then
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
            break
        fi
        sleep 5
    done

    if [ "$SUCCESS_COUNT" -eq 0 ]; then
        echo "[MONITOR] Backend is DOWN. Activating Maintenance Mode..."
        bash "$MAINTENANCE_SCRIPT" on
    else
        echo "[MONITOR] Backend is UP. Deactivating Maintenance Mode..."
        bash "$MAINTENANCE_SCRIPT" off
    fi

    sleep "$CHECK_INTERVAL"
done
