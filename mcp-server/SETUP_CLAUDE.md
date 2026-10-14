# Configuração do FiboGrid MCP Server no Claude Desktop

## Passo 1: Localizar o arquivo de configuração

O arquivo de configuração do Claude Desktop está em:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

## Passo 2: Adicionar o servidor FiboGrid

Abra o arquivo `claude_desktop_config.json` e adicione a configuração do servidor FiboGrid:

```json
{
  "mcpServers": {
    "fibogrid": {
      "command": "node",
      "args": [
        "<path-to-fibogrid>/mcp-server/dist/index.js"
      ]
    }
  }
}
```

Se você já tiver outros servidores MCP configurados, adicione o `fibogrid` dentro do objeto `mcpServers`:

```json
{
  "mcpServers": {
    "existing-server": {
      "command": "...",
      "args": ["..."]
    },
    "fibogrid": {
      "command": "node",
      "args": [
        "<path-to-fibogrid>/mcp-server/dist/index.js"
      ]
    }
  }
}
```

## Passo 3: Reiniciar o Claude Desktop

Feche completamente o Claude Desktop e abra novamente para que as mudanças tenham efeito.

## Passo 4: Verificar a conexão

Após reiniciar, você pode testar o servidor perguntando ao Claude:

- "Mostre-me o README do FiboGrid"
- "Pesquise na documentação do FiboGrid por paginação"
- "Gere um exemplo de ColumnDef com sorting e filtering"
- "Crie uma configuração completa de grid para um tipo User com paginação"

## Recursos Disponíveis

### Documentação
- `fibogrid://readme` - README principal
- `fibogrid://usage` - Guia de uso com exemplos TypeScript
- `fibogrid://theming` - Guia de temas e customização
- `fibogrid://changelog` - Histórico de versões

### API Reference
- `fibogrid://api/types` - Definições de tipos TypeScript
- `fibogrid://api/hooks` - Hooks React disponíveis
- `fibogrid://api/components` - Componentes exportados

### Exemplos
- `fibogrid://examples/basic` - Grid básico
- `fibogrid://examples/server-side` - Paginação server-side
- `fibogrid://examples/custom-renderer` - Cell renderer customizado

## Ferramentas Disponíveis

### 1. search_fibogrid_docs
Busca na documentação do FiboGrid.

**Exemplo de uso:**
```
"Pesquise na documentação do FiboGrid por 'pagination'"
```

### 2. get_column_def_example
Gera exemplos de ColumnDef com features específicas.

**Exemplo de uso:**
```
"Gere um exemplo de ColumnDef com sorting, filtering e editable para um campo do tipo number"
```

### 3. generate_grid_config
Gera configuração completa de grid.

**Exemplo de uso:**
```
"Crie uma configuração de grid para um tipo Product com paginação, seleção de linhas e toolbar"
```

## Troubleshooting

### Servidor não aparece no Claude Desktop

1. Verifique se o caminho no `claude_desktop_config.json` está correto
2. Certifique-se de que o servidor foi compilado (`npm run build`)
3. Reinicie completamente o Claude Desktop
4. Verifique os logs do Claude Desktop em `~/Library/Logs/Claude/`

### Erros ao executar

1. Verifique se o Node.js está instalado: `node --version`
2. Certifique-se de que as dependências foram instaladas: `cd <path-to-fibogrid>/mcp-server && npm install`
3. Recompile o servidor: `npm run build`

## Comandos Úteis

```bash
# Instalar dependências
cd <path-to-fibogrid>/mcp-server
npm install

# Compilar
npm run build

# Modo desenvolvimento (watch)
npm run dev

# Testar manualmente
node dist/index.js
```

## Exemplos de Perguntas para o Claude

Uma vez configurado, você pode fazer perguntas como:

1. **Documentação:**
   - "Mostre-me o README do FiboGrid"
   - "Quais são os hooks disponíveis no FiboGrid?"
   - "Como funciona o theming no FiboGrid?"

2. **Busca:**
   - "Pesquise na documentação do FiboGrid por 'server-side pagination'"
   - "Encontre informações sobre cell renderers customizados"

3. **Geração de Código:**
   - "Gere um ColumnDef com sorting, filtering e pinned left"
   - "Crie uma configuração completa de grid para um tipo User com paginação server-side"
   - "Mostre-me um exemplo de grid com custom cell renderer"

4. **Tipos e API:**
   - "Quais são os tipos disponíveis no FiboGrid?"
   - "Como usar o GridApi?"
   - "Quais eventos estão disponíveis?"
