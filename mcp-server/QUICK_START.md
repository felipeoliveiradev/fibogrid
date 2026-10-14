# 🚀 Guia Rápido - FiboGrid MCP Server

## ✅ Setup Completo!

O servidor FiboGrid MCP foi configurado com sucesso no Claude Desktop.

### 📁 Arquivos Criados

```
<path-to-fibogrid>/mcp-server/
├── src/index.ts              # Código fonte do servidor
├── dist/index.js             # Servidor compilado
├── package.json              # Configuração do projeto
├── tsconfig.json             # Configuração TypeScript
├── README.md                 # Documentação principal
├── SETUP_CLAUDE.md           # Guia de configuração
├── configure-claude.sh       # Script de configuração ✨
└── test-server.sh            # Script de teste ✨
```

### ⚙️ Configuração do Claude Desktop

**Arquivo:** `~/Library/Application Support/Claude/claude_desktop_config.json`

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

✅ **Backup criado em:** `claude_desktop_config.json.backup`

---

## 🎯 Próximo Passo: REINICIAR CLAUDE DESKTOP

**IMPORTANTE:** Para que o servidor MCP funcione, você precisa:

1. **Fechar completamente o Claude Desktop**
   - Cmd + Q (não apenas fechar a janela)
   - Ou: Claude Desktop → Quit Claude Desktop

2. **Abrir novamente o Claude Desktop**

3. **Verificar se o servidor está ativo**
   - O ícone do MCP deve aparecer
   - Você pode ver os servidores conectados

---

## 💬 Exemplos de Perguntas para Testar

### 📚 Acessar Documentação

```
"Mostre-me o README do FiboGrid"
"Quais são os hooks disponíveis no FiboGrid?"
"Como funciona o theming no FiboGrid?"
"Mostre-me o changelog do FiboGrid"
```

### 🔍 Buscar Informações

```
"Pesquise na documentação do FiboGrid por 'pagination'"
"Encontre informações sobre server-side data source"
"Busque exemplos de cell renderer customizado"
"Procure por 'row grouping' na documentação"
```

### 🛠️ Gerar Código

```
"Gere um ColumnDef com sorting e filtering para um campo de email"
"Crie um ColumnDef para um campo number com editable e pinned left"
"Mostre um exemplo de ColumnDef com custom cell renderer"
```

```
"Crie uma configuração de grid para um tipo User com paginação"
"Gere um grid completo para Product com server-side pagination"
"Configure um grid com row selection, toolbar e status bar"
```

### 📖 Consultar API

```
"Quais tipos estão disponíveis no FiboGrid?"
"Como usar o GridApi?"
"Quais eventos posso escutar no grid?"
"Mostre-me os componentes exportados"
```

---

## 🧪 Testar o Servidor Manualmente

Se quiser testar o servidor diretamente:

```bash
# Testar inicialização
node <path-to-fibogrid>/mcp-server/dist/index.js

# Ou usar o script de teste
<path-to-fibogrid>/mcp-server/test-server.sh
```

---

## 🔧 Comandos Úteis

### Recompilar o servidor
```bash
cd <path-to-fibogrid>/mcp-server
npm run build
```

### Reconfigurar Claude Desktop
```bash
<path-to-fibogrid>/mcp-server/configure-claude.sh
```

### Restaurar configuração anterior
```bash
cp ~/Library/Application\ Support/Claude/claude_desktop_config.json.backup \
   ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

---

## 📊 Recursos Disponíveis

### Documentação (4)
- `fibogrid://readme` - README principal
- `fibogrid://usage` - Guia de uso TypeScript
- `fibogrid://theming` - Guia de temas
- `fibogrid://changelog` - Histórico de versões

### API Reference (3)
- `fibogrid://api/types` - Tipos TypeScript
- `fibogrid://api/hooks` - Hooks React
- `fibogrid://api/components` - Componentes

### Exemplos (3)
- `fibogrid://examples/basic` - Grid básico
- `fibogrid://examples/server-side` - Server-side
- `fibogrid://examples/custom-renderer` - Custom renderer

---

## 🛠️ Ferramentas Disponíveis

### 1. search_fibogrid_docs
Busca na documentação do FiboGrid.

**Exemplo:**
> "Pesquise na documentação do FiboGrid por 'pagination'"

### 2. get_column_def_example
Gera exemplos de ColumnDef com features específicas.

**Exemplo:**
> "Gere um ColumnDef com sorting, filtering e editable para um campo number"

### 3. generate_grid_config
Gera configuração completa de grid.

**Exemplo:**
> "Crie uma configuração de grid para tipo User com paginação e row-selection"

---

## ❓ Troubleshooting

### Servidor não aparece no Claude Desktop

1. ✅ Verifique se o caminho está correto no `claude_desktop_config.json`
2. ✅ Certifique-se de que o servidor foi compilado (`npm run build`)
3. ✅ Reinicie **completamente** o Claude Desktop (Cmd + Q)
4. ✅ Verifique os logs em `~/Library/Logs/Claude/`

### Erros ao executar

1. ✅ Verifique Node.js: `node --version` (precisa ser 18+)
2. ✅ Reinstale dependências: `cd mcp-server && npm install`
3. ✅ Recompile: `npm run build`

---

## 🎉 Tudo Pronto!

Agora você pode:

1. ✅ Acessar toda documentação do FiboGrid via Claude
2. ✅ Buscar informações específicas rapidamente
3. ✅ Gerar código TypeScript automaticamente
4. ✅ Consultar API e tipos sem sair do Claude

**Aproveite o seu novo servidor MCP! 🚀**
