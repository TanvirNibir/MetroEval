#!/bin/bash
set -e

# Find and install requirements
REQ_FILE=$(find . -name "requirements.txt" -type f | head -1)
if [ -z "$REQ_FILE" ]; then
    echo "ERROR: requirements.txt not found"
    echo "Current directory: $(pwd)"
    echo "Files in current directory:"
    ls -la
    exit 1
fi

echo "Found requirements.txt at: $REQ_FILE"
pip install --upgrade pip
pip install -r "$REQ_FILE"

