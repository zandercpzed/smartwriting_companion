# SmartWriting companion

> **Assistente editorial local-first para autores de ficção no Obsidian**

---

## Visão do Produto

SmartWriting companion é um plugin para Obsidian que prepara textos de ficção para publicação — limpando formatação, analisando métricas editoriais e oferecendo feedback de leitores simulados — tudo **processando localmente** quando possível.

**Tagline:** _Seu editor de bolso. Seu texto, suas regras._

---

## O Problema

Autores de ficção (especialmente SF/Fantasy) enfrentam um gap entre escrever e publicar:

| Ferramentas Profissionais | Plugins Obsidian Atuais             |
| ------------------------- | ----------------------------------- |
| ProWritingAid ($120/ano)  | Longform (apenas organização)       |
| AutoCrit ($30/mês)        | Writing Goals (apenas estatísticas) |
| Hemingway ($20 único)     | LanguageTool (apenas gramática)     |
| Scrivener ($60)           | Nenhum focado em ficção             |

**O gap:** Nenhuma solução combina:

- Limpeza automática de formatação
- Métricas específicas para ficção
- Feedback de "leitores" antes de beta readers reais
- Tradução consciente de worldbuilding
- Processamento local/offline

---

## Proposta de Valor

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Limpeza automática (aspas, travessões, espaços)              │
│   + Métricas editoriais (legibilidade, estilo, ficção)         │
│   + Feedback de 3 personas de leitores (via LLM)               │
│   + Tradução PT↔EN que preserva nomes e termos inventados      │
│   + Processamento local-first (Ollama) com fallback cloud      │
│   + Integração nativa com fluxo de escrita no Obsidian         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Público-Alvo

### Primário

- **Autores de SF/Fantasy** que usam Obsidian para worldbuilding e escrita
- **Escritores indie** preparando manuscritos para self-publishing
- **Autores bilíngues** que escrevem/traduzem entre PT e EN

### Secundário

- Escritores de outros gêneros que valorizam métricas de estilo
- Blogueiros e criadores de conteúdo longo
- Estudantes de escrita criativa

### Persona Principal

> **Lucas, 29, Autor Indie de Fantasia**  
> Escreve seu primeiro romance no Obsidian (120k palavras). Precisa preparar o manuscrito para beta readers mas não tem budget para ProWritingAid. Quer saber se o ritmo está bom antes de mostrar para alguém. Tem Ollama instalado porque usa para outros projetos.

---

## Funcionalidades Core

### Tier Gratuito (v1.0)

| Funcionalidade         | Descrição                                         | Dependência              |
| ---------------------- | ------------------------------------------------- | ------------------------ |
| **Limpeza de Texto**   | Normaliza aspas, travessões, reticências, espaços | Local (regex)            |
| **Estatísticas**       | Words, characters, sentences, reading time        | Local (JS)               |
| **Legibilidade**       | 7 métricas (Flesch-Kincaid, Gunning Fog, etc.)    | Local (text-readability) |
| **Análise de Estilo**  | Voz passiva, advérbios, frases longas             | Local (compromise)       |
| **Métricas de Ficção** | Ratio diálogo, show vs tell, filter words         | Local (regex + NLP)      |

### Tier Completo (v1.0 com LLM)

| Funcionalidade            | Descrição                            | Dependência          |
| ------------------------- | ------------------------------------ | -------------------- |
| **Avaliação por Persona** | Feedback de 3 tipos de leitores      | LLM (local ou cloud) |
| **Tradução Contextual**   | PT↔EN preservando termos de mundo   | LLM (local ou cloud) |
| **Show vs Tell Avançado** | Identificação de passagens "telling" | LLM (local ou cloud) |

### Futuro (v2.0+)

- Presets por gênero (Romance, Thriller, Literary Fiction)
- Comparação com benchmarks de best-sellers
- Exportação de relatório editorial em PDF
- Integração com Longform plugin
- Sugestões de reescrita (não apenas identificação)

---

## Arquitetura Técnica

```
┌─────────────────────────────────────────────────────────────────────┐
│                           OBSIDIAN HOST                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                 SMARTWRITING COMPANION PLUGIN                  │  │
│  │                                                                │  │
│  │   ┌──────────────────────────────────────────────────────┐    │  │
│  │   │                    UI LAYER                           │    │  │
│  │   │  CompanionView │ Blobs │ Editor Decorations │ Commands│    │  │
│  │   └─────────────────────────┬────────────────────────────┘    │  │
│  │                             │                                  │  │
│  │                             ▼                                  │  │
│  │   ┌──────────────────────────────────────────────────────┐    │  │
│  │   │                   ORCHESTRATOR                        │    │  │
│  │   │            (Coordena fluxos e estado)                │    │  │
│  │   └─────────────────────────┬────────────────────────────┘    │  │
│  │                             │                                  │  │
│  │          ┌──────────────────┼──────────────────┐              │  │
│  │          ▼                  ▼                  ▼              │  │
│  │   ┌────────────┐    ┌────────────┐    ┌────────────┐         │  │
│  │   │  Analysis  │    │  Cleanup   │    │ Translation│         │  │
│  │   │  Service   │    │  Service   │    │  Service   │         │  │
│  │   └─────┬──────┘    └─────┬──────┘    └─────┬──────┘         │  │
│  │         │                 │                 │                 │  │
│  │   ┌─────┴─────┐     ┌─────┴─────┐     ┌─────┴─────┐          │  │
│  │   │ Analyzers │     │TextCleanup│     │ LLM Gate  │          │  │
│  │   │ (Local)   │     │ (Regex)   │     │   way     │          │  │
│  │   └───────────┘     └───────────┘     └─────┬─────┘          │  │
│  │                                             │                 │  │
│  └─────────────────────────────────────────────┼─────────────────┘  │
└────────────────────────────────────────────────┼────────────────────┘
                                                 │
                    ┌────────────────────────────┼────────────────┐
                    ▼                            ▼                ▼
             ┌─────────────┐             ┌─────────────┐   ┌─────────────┐
             │   Ollama    │             │   Gemini    │   │   OpenAI    │
             │   (local)   │             │   (cloud)   │   │   (cloud)   │
             │  PRIORIDADE │             │  FALLBACK   │   │  FALLBACK   │
             └─────────────┘             └─────────────┘   └─────────────┘
```

---

## Stack Tecnológico

| Camada              | Tecnologia       | Justificativa                  |
| ------------------- | ---------------- | ------------------------------ |
| **Linguagem**       | TypeScript       | Padrão Obsidian, type-safety   |
| **Build**           | esbuild          | Rápido, padrão da comunidade   |
| **Legibilidade**    | text-readability | 7 métricas, ~15KB              |
| **NLP**             | compromise       | Browser-first, ~80KB           |
| **Detecção idioma** | tinyld           | 99% precisão, ~15KB            |
| **LLM Local**       | Ollama           | Setup simples, API padrão      |
| **Modelo sugerido** | Qwen 2.5 7B      | Melhor multilíngue, Apache 2.0 |
| **LLM Cloud**       | Gemini Flash     | Free tier generoso             |

### Bundle Estimado

```
text-readability    ~15KB
compromise          ~80KB
tinyld              ~15KB
reading-time         ~5KB
─────────────────────────
Total              ~115KB (gzipped)
```

### Requisitos de Sistema

```
Tier Gratuito (análise local):
├── RAM: 4GB
├── Storage: <1MB
└── CPU: Qualquer

Tier Completo (com Ollama):
├── RAM: 8-16GB
├── Storage: 5GB (modelo)
└── CPU/GPU: Recomendado Apple Silicon ou NVIDIA
```

---

## Fluxo Principal: Limpeza

```
    ┌──────────────┐
    │ Usuário clica│
    │ [🧹 Limpar]  │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Detecta escopo│
    │ (seleção ou  │
    │  documento)  │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐     ┌──────────────┐
    │TextCleanup   │────▶│ Gera lista   │
    │(regex local) │     │ de sugestões │
    └──────────────┘     └──────┬───────┘
                                │
           ┌────────────────────┘
           │
           ▼
    ┌──────────────┐     ┌──────────────┐
    │  Highlights  │────▶│ Blob na      │
    │  no editor   │     │ sidebar      │
    └──────────────┘     └──────┬───────┘
                                │
           ┌────────────────────┘
           │
           ▼
    ┌──────────────┐     ┌──────────────┐
    │ Usuário      │────▶│ Texto limpo  │
    │ aceita/rejeita     │ aplicado     │
    └──────────────┘     └──────────────┘

    Latência alvo: < 100ms para 50k palavras
```

---

## Personas de Avaliação

### 📱 Booktuber / Influencer

**Perfil:** Avalia livros para redes sociais, busca ganchos vendáveis

**Critérios:**

- Hook dos primeiros parágrafos (dá pra vender em 15s?)
- Cenas "instagramáveis" (visuais marcantes)
- Quotes para legenda
- Ritmo para atenção curta

### 📚 Leitor Contumaz SF/Fantasy

**Perfil:** Lê 50+ livros/ano no gênero, fã de Sanderson/Rothfuss

**Critérios:**

- Consistência do worldbuilding
- Sistema de magia coerente
- Desenvolvimento de personagens
- Originalidade da premissa

### 📖 Leitor Casual

**Perfil:** Lê 1-6 livros/ano, prefere histórias acessíveis

**Critérios:**

- Facilidade de acompanhar
- Personagens relacionáveis
- Ritmo envolvente
- Clareza sem jargão excessivo

---

## Diferenciais Competitivos

| Aspecto              | ProWritingAid | AutoCrit | Hemingway | Smart Writing     |
| -------------------- | ------------- | -------- | --------- | ----------------- |
| Preço                | $120/ano      | $30/mês  | $20 único | **Grátis**        |
| Integração Obsidian  | ❌            | ❌       | ❌        | **✅ Nativa**     |
| Processamento local  | ❌            | ❌       | ❌        | **✅**            |
| Métricas de ficção   | ⚠️ Genérico   | ✅       | ❌        | **✅ SF/Fantasy** |
| Feedback de leitores | ❌            | ❌       | ❌        | **✅ 3 personas** |
| Tradução contextual  | ❌            | ❌       | ❌        | **✅**            |
| Offline              | ❌            | ❌       | ✅        | **✅**            |

---

## Modelo de Distribuição

```
┌─────────────────────────────────────────────────────────────────┐
│                  Open Source (GPL-3.0 License)                   │
│                                                                 │
│   Plugin gratuito via Obsidian Community Plugins                │
│   Código aberto no GitHub                                       │
│   Documentação completa                                         │
│   Todas as funcionalidades incluídas                           │
│                                                                 │
│   Repository: github.com/zandercpzed/text_companion            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Monetização potencial (futuro):**

- Pacotes de personas adicionais (Romance, Thriller, Literary)
- Modelos fine-tuned para gêneros específicos
- Versão "Pro" com UI standalone para não-usuários de Obsidian
- Consultoria para editoras

---

## Métricas de Sucesso

### Técnicas

| Métrica                 | Alvo MVP | Alvo v2.0 |
| ----------------------- | -------- | --------- |
| Análise de 50k palavras | < 500ms  | < 200ms   |
| Limpeza de 50k palavras | < 100ms  | < 50ms    |
| LLM local (avaliação)   | < 5s     | < 3s      |
| Bundle size             | < 200KB  | < 150KB   |

### Produto

| Métrica                     | Alvo 6 meses | Alvo 12 meses |
| --------------------------- | ------------ | ------------- |
| Downloads                   | 2.000        | 15.000        |
| GitHub Stars                | 300          | 1.500         |
| Usuários ativos semanais    | 500          | 5.000         |
| Rating no Community Plugins | 4.5+         | 4.7+          |

---

## Riscos e Mitigações

| Risco                                     | Probabilidade | Impacto | Mitigação                                                |
| ----------------------------------------- | ------------- | ------- | -------------------------------------------------------- |
| Ollama setup complexo para usuários       | Alta          | Alto    | Tier gratuito funciona 100% sem LLM; documentação visual |
| Qualidade das avaliações por persona      | Média         | Alto    | Prompts refinados; feedback dos usuários; iteração       |
| Conflito com outros plugins de escrita    | Média         | Médio   | API isolada; testes com Longform, Writing Goals          |
| Performance em documentos muito grandes   | Baixa         | Médio   | Processamento em chunks; Web Workers                     |
| Precisão da tradução de termos inventados | Média         | Médio   | Lista de termos customizável por vault                   |

---

## Roadmap

```
JAN 2025 ─────────────────────────────────────────────────────────
│
├── v0.1 Alpha
│   ├── Settings tab
│   ├── LLM Gateway (Ollama)
│   └── Estrutura base
│
├── v0.5 Beta
│   ├── Análise local completa
│   ├── CompanionView (sidebar)
│   └── Sistema de métricas

FEV 2025 ─────────────────────────────────────────────────────────
│
├── v0.8 Beta
│   ├── TextCleanup
│   ├── Sugestões inline
│   └── Sistema de blobs
│
└── v1.0 Release
    ├── Personas funcionando
    ├── Tradução contextual
    └── Submissão Community Plugins

MAR-ABR 2025 ─────────────────────────────────────────────────────
│
├── v1.1
│   ├── Presets por gênero
│   └── Melhorias de UX baseadas em feedback
│
└── v1.2
    ├── Exportação de relatório
    └── Integração Longform plugin

Q3 2025 ──────────────────────────────────────────────────────────
│
└── v2.0
    ├── Sugestões de reescrita (não só identificação)
    ├── Benchmark com best-sellers
    └── Personas customizáveis
```

---

## Decisões Arquiteturais Chave

### ADR-001: Arquitetura em Camadas vs. Monólito

**Decisão:** Camadas desacopladas (Services → Analyzers → Gateway)  
**Motivo:** Testabilidade, manutenibilidade, permite desabilitar LLM sem quebrar análise local

### ADR-002: LLM Gateway com Fallback Automático

**Decisão:** Ollama → Gemini → OpenAI (configurável)  
**Motivo:** Prioriza local, mas garante funcionalidade se Ollama não disponível

### ADR-003: Sugestões Inline vs. Modal

**Decisão:** Inline com highlights + sidebar de blobs  
**Motivo:** Padrão Grammarly comprovado; não interrompe fluxo de escrita

### ADR-004: Personas como Prompts Markdown

**Decisão:** Personas definidas em arquivos .md no plugin  
**Motivo:** Fácil de editar/customizar; permite contribuição da comunidade

---

## Chamada para Ação

> **Próximo passo:** Criar estrutura do projeto com arquivos base (manifest.json, package.json, main.ts, tsconfig.json) e implementar Settings Tab com configuração de LLM.

---

## Documentos Relacionados

| Documento                  | Descrição                            | Localização                               |
| -------------------------- | ------------------------------------ | ----------------------------------------- |
| Arquitetura Técnica        | Detalhamento de componentes e código | `smart-writing-companion-architecture.md` |
| Especificação de Interface | Layout, componentes, estados         | `smart-writing-companion-interface-v2.md` |
| Pesquisa de Mercado        | Benchmark, LLMs, bibliotecas         | `smartwriting-companion-research.md`      |

---

## Links

| Recurso                | URL                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| **Repositório GitHub** | [github.com/zandercpzed/text_companion](https://github.com/zandercpzed/text_companion)                   |
| **Issues**             | [github.com/zandercpzed/text_companion/issues](https://github.com/zandercpzed/text_companion/issues)     |
| **Releases**           | [github.com/zandercpzed/text_companion/releases](https://github.com/zandercpzed/text_companion/releases) |

---

_Documento versão 1.0 — Dezembro 2024_  
_Projeto: SmartWriting companion_  
_Repositório: text_companion_
