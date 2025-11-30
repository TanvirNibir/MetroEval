#!/bin/sh
set -e

# Default backend URL if not set
if [ -z "$REACT_APP_API_URL" ]; then
    # Try to construct from Render service name, or use default
    if [ -n "$RENDER_SERVICE_NAME" ]; then
        export REACT_APP_API_URL="https://${RENDER_SERVICE_NAME}.onrender.com"
    else
        export REACT_APP_API_URL="http://localhost:5001"
    fi
fi

# Export for envsubst
export REACT_APP_API_URL

# Generate nginx config from template using envsubst
# Only substitute REACT_APP_API_URL, leave nginx variables ($host, $uri, etc.) intact
envsubst '${REACT_APP_API_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Execute the main command (nginx)
exec "$@"

