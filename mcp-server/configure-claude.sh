#!/bin/bash
set -euo pipefail

# Configure FiboGrid MCP Server in Claude Desktop (paths relative to this script).

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MCP_SERVER_PATH="$SCRIPT_DIR/dist/index.js"
CONFIG_FILE="${CLAUDE_CONFIG_FILE:-$HOME/Library/Application Support/Claude/claude_desktop_config.json}"
BACKUP_FILE="${CONFIG_FILE}.backup"

echo "Configuring FiboGrid MCP Server for Claude Desktop..."
echo ""

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Config file not found. Creating a new one..."
    mkdir -p "$(dirname "$CONFIG_FILE")"
    echo '{"mcpServers":{}}' > "$CONFIG_FILE"
fi

echo "Backing up current config..."
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "Backup: $BACKUP_FILE"
echo ""

if [ ! -f "$MCP_SERVER_PATH" ]; then
    echo "MCP server not found at: $MCP_SERVER_PATH"
    echo "Run: cd \"$SCRIPT_DIR\" && npm run build"
    exit 1
fi

if grep -q '"fibogrid"' "$CONFIG_FILE"; then
    echo "Updating existing FiboGrid MCP entry..."
else
    echo "Adding FiboGrid MCP entry..."
fi

node -e "
const fs = require('fs');
const configPath = process.argv[1];
const serverPath = process.argv[2];
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
if (!config.mcpServers) config.mcpServers = {};
config.mcpServers.fibogrid = {
  command: 'node',
  args: [serverPath]
};
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Config updated.');
" "$CONFIG_FILE" "$MCP_SERVER_PATH"

echo ""
echo "Done. Restart Claude Desktop, then try:"
echo "  - Show me the FiboGrid README"
echo "  - Search FiboGrid docs for pagination"
echo ""
echo "Restore previous config with:"
echo "  cp \"$BACKUP_FILE\" \"$CONFIG_FILE\""
