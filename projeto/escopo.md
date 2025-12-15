# Escopo de Projeto: SmartWriting Companion

O **SmartWriting Companion** é um plugin para Obsidian focado em auxiliar escritores de ficção com análise de texto _local-first_, limpeza automática e feedback de personas via LLM.

## Funcionalidades Principais

### 1. Análise de Texto (Local)

Processamento instantâneo do texto para fornecer métricas sem depender de internet.

- **Estatísticas Básicas:** Contagem de palavras, caracteres, tempo de leitura.
- **Legibilidade:**
  - Índice Flesch-Kincaid (foco em níveis 7-9 para ficção).
  - Outros índices: Coleman-Liau, Gunning Fog, SMOG, ARI, Dale-Chall.
- **Análise Estilística:**
  - Detecção de Voz Passiva.
  - Contagem e densidade de Advérbios.
  - Identificação de "Filter Words" (palavras que filtram a experiência do leitor, ex: "viu", "sentiu").
  - Alerta de frases muito longas.
- **Métricas de Ficção:**
  - Proporção Diálogo vs. Narrativa.
  - Detecção de cenas.

### 2. Personas de Feedback (LLM)

Simulação de diferentes perfis de leitores para avaliar trechos do texto.

- **Perfis Pré-definidos:**
  - _Booktuber:_ Foco em ganchos e engajamento.
  - _Leitor Hardcore:_ Foco em consistência de worldbuilding e lógica.
  - _Leitor Casual:_ Foco em acessibilidade e fluidez.
- **Arquitetura Híbrida:**
  - Suporte prioritário a **Ollama** (rodando localmente).
  - Fallback para nuvem (Gemini, OpenAI, Anthropic) configurável.

### 3. Limpeza de Texto (Utilities)

Ferramentas para padronização e formatação do manuscrito.

- Conversão de aspas retas para curvas (Smart Quotes).
- Padronização de travessões (Em-dash/En-dash).
- Correção de reticências.
- Remoção de espaços duplos e excesso de quebras de linha.

### 4. Interface do Usuário (UI)

- **Sidebar Dedicada:** Painel lateral direito com visualização persistente das métricas.
- **Design Moderno:** Uso de tokens de design, barras de progresso coloridas e cards interativos.
- **Acesso Rápido:** Ícone na barra de título (Top Bar) do Obsidian para alternar visibilidade.
- **Inline Suggestions:** (Planejado) Grifos sutis no editor para apontar problemas estilísticos.

### 5. Configurações

- Painel completo para ajustar limites (ex: comprimento máximo de frase, % de voz passiva).
- Configuração de conexão com LLMs (URLs, chaves de API).
- Toggle para recursos específicos.
