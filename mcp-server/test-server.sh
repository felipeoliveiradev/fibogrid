#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MCP_SERVER_PATH="$SCRIPT_DIR/dist/index.js"

echo "Testing FiboGrid MCP Server..."
echo ""

if [ ! -f "$MCP_SERVER_PATH" ]; then
    echo "Server not found at: $MCP_SERVER_PATH"
    echo "Run: cd \"$SCRIPT_DIR\" && npm run build"
    exit 1
fi

echo "Server binary found"
echo ""

if ! command -v node >/dev/null 2>&1; then
    echo "Node.js is not installed"
    exit 1
fi

echo "Node.js: $(node --version)"
echo ""
echo "Starting server briefly..."

node "$MCP_SERVER_PATH" >/tmp/fibogrid-mcp-test.log 2>&1 &
PID=$!
sleep 1

if kill -0 "$PID" 2>/dev/null; then
    echo "Server started (pid $PID)"
    kill "$PID" 2>/dev/null || true
    wait "$PID" 2>/dev/null || true
else
    echo "Server may have failed to start — see /tmp/fibogrid-mcp-test.log"
    exit 1
fi

echo ""
echo "OK. Restart Claude Desktop after configure-claude.sh if you changed MCP config."
