# Scripts

## Generate Favicon

Para gerar o arquivo `favicon.ico` a partir do `favicon.svg`:

1. Instale as dependências:
```bash
npm install -D sharp to-ico
```

2. Execute o script:
```bash
node scripts/generate-favicon.js
```

O arquivo `favicon.ico` será gerado em `public/favicon.ico`.

### Alternativa Online

Se preferir, você pode usar uma ferramenta online para converter o SVG para ICO:
- https://convertio.co/svg-ico/
- https://cloudconvert.com/svg-to-ico

Basta fazer upload do arquivo `public/favicon.svg` e baixar o `.ico` gerado.

