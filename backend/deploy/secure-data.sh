#!/bin/bash
# PlanForge Database Permission Script
# Run this to secure your data files

set -e

echo "Securing PlanForge data files..."

DATA_DIR="$(dirname "$0")/data"

if [ ! -d "$DATA_DIR" ]; then
    echo "Data directory not found: $DATA_DIR"
    exit 1
fi

# Set strict permissions on data files
chmod 600 "$DATA_DIR"/*.json 2>/dev/null || true
chmod 700 "$DATA_DIR"

echo "Permissions set:"
ls -la "$DATA_DIR"

echo "Done! Data files are now secured (600 - owner read/write only)"
