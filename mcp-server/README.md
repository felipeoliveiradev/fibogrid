# FiboGrid MCP Server

Model Context Protocol server for FiboGrid - provides documentation, type definitions, examples, and code generation tools.

## Features

### 📚 Resources

Access comprehensive FiboGrid documentation:

- `fibogrid://readme` - Main README with features and quick start
- `fibogrid://usage` - TypeScript usage examples and patterns
- `fibogrid://theming` - Theming and customization guide
- `fibogrid://changelog` - Version history
- `fibogrid://api/types` - Complete type definitions
- `fibogrid://api/hooks` - React hooks reference
- `fibogrid://api/components` - Component API reference
- `fibogrid://examples/basic` - Basic grid example
- `fibogrid://examples/server-side` - Server-side pagination example
- `fibogrid://examples/custom-renderer` - Custom cell renderer example

### 🛠️ Tools

Intelligent code generation and search:

1. **search_fibogrid_docs** - Search documentation for specific topics
   ```json
   {
     "query": "pagination"
   }
   ```

2. **get_column_def_example** - Generate ColumnDef with specific features
   ```json
   {
     "features": ["sortable", "filterable", "editable"],
     "fieldType": "number"
   }
   ```

3. **generate_grid_config** - Generate complete grid configuration
   ```json
   {
     "dataType": "User",
     "features": ["pagination", "row-selection", "toolbar"],
     "serverSide": false
   }
   ```

## Installation

```bash
cd <path-to-fibogrid>/mcp-server
npm install
npm run build
```

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "fibogrid": {
      "command": "node",
      "args": ["<path-to-fibogrid>/mcp-server/dist/index.js"]
    }
  }
}
```

### With Other MCP Clients

```bash
node <path-to-fibogrid>/mcp-server/dist/index.js
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev
```

## Example Queries

Once configured, you can ask Claude:

- "Show me the FiboGrid README"
- "Search FiboGrid docs for server-side pagination"
- "Generate a ColumnDef with sorting and filtering"
- "Create a complete grid config for a User type with pagination and row selection"
- "What hooks are available in FiboGrid?"
- "Show me an example of custom cell renderer"

## Resources Available

All FiboGrid documentation is accessible through the MCP protocol:

- **Documentation**: README, Usage Guide, Theming Guide, Changelog
- **API Reference**: Types, Hooks, Components
- **Examples**: Basic, Server-side, Custom Renderers

## Tools Available

- **search_fibogrid_docs**: Semantic search across all documentation
- **get_column_def_example**: Generate column definitions with specific features
- **generate_grid_config**: Generate complete grid configurations

## License

MIT © Felipe Oliveira
