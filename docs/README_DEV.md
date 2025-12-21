# Development - SmartWrite Companion

Requisitos:

- Node.js >= 18
- npm ou yarn
- Obsidian desktop instalada para testar o plugin localmente

Scripts úteis:

- Instalar dependências:

```bash
npm install
```

- Compilar TypeScript para `dist/`:

```bash
npm run build
```

- Obsidian local testing (manual):
  - Abra o diretório do vault do Obsidian
  - Copie a pasta do plugin `smartwrite-companion` para `.obsidian/plugins/`
  - Ative o plugin nas configurações do Obsidian

- Empacotar para distribuição:
  - Gere `dist/main.js` via `npm run build` e envie o conteúdo do plugin (manifest.json + main.js + styles) ao canal de distribuição desejado.
