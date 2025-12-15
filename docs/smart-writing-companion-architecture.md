# SmartWriting companion — Arquitetura Técnica

> **Plugin de preparação editorial para Obsidian com processamento local**

---

## Visão Geral da Arquitetura

O SmartWriting companion é estruturado em **camadas desacopladas** que se comunicam através de interfaces bem definidas. A arquitetura prioriza processamento local, fallback gracioso para cloud quando necessário, e extensibilidade para futuras funcionalidades.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              OBSIDIAN HOST                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      SMARTWRITING COMPANION PLUGIN                     │  │
│  │                                                                        │  │
│  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                 │  │
│  │   │  UI Layer   │   │  Commands   │   │  Settings   │                 │  │
│  │   │  (Views)    │   │  (Actions)  │   │   (Tab)     │                 │  │
│  │   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘                 │  │
│  │          │                 │                 │                         │  │
│  │          └─────────────────┼─────────────────┘                         │  │
│  │                            ▼                                           │  │
│  │   ┌────────────────────────────────────────────────────────────────┐  │  │
│  │   │                    ORCHESTRATOR                                 │  │  │
│  │   │              (Coordena fluxos e estado)                        │  │  │
│  │   └────────────────────────────────────────────────────────────────┘  │  │
│  │                            │                                           │  │
│  │          ┌─────────────────┼─────────────────┐                         │  │
│  │          ▼                 ▼                 ▼                         │  │
│  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                 │  │
│  │   │  Analysis   │   │  Cleanup    │   │ Translation │                 │  │
│  │   │  Service    │   │  Service    │   │  Service    │                 │  │
│  │   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘                 │  │
│  │          │                 │                 │                         │  │
│  │          └─────────────────┼─────────────────┘                         │  │
│  │                            ▼                                           │  │
│  │   ┌────────────────────────────────────────────────────────────────┐  │  │
│  │   │                    LLM GATEWAY                                  │  │  │
│  │   │         (Abstração local/cloud, retry, cache)                  │  │  │
│  │   └────────────────────────────────────────────────────────────────┘  │  │
│  │                            │                                           │  │
│  └────────────────────────────┼───────────────────────────────────────────┘  │
│                               │                                              │
└───────────────────────────────┼──────────────────────────────────────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
     │   Ollama    │     │   Gemini    │     │   OpenAI    │
     │   (local)   │     │   (cloud)   │     │   (cloud)   │
     └─────────────┘     └─────────────┘     └─────────────┘
```

---

## Restrições e Limitações do Obsidian

### Ambiente de Execução

| Aspecto | Restrição | Impacto na Arquitetura |
|---------|-----------|------------------------|
| **Runtime** | Electron (Chromium sandbox) | Sem acesso direto a filesystem nativo; usar Vault API |
| **Módulos Node** | Limitados no renderer | Bibliotecas devem ser browser-compatible |
| **CORS** | Bloqueado para fetch() | Usar `requestUrl()` do Obsidian para HTTP externo |
| **Workers** | Web Workers disponíveis | Processamento pesado pode usar workers |
| **Tamanho do bundle** | Não há limite oficial, mas < 5MB recomendado | Lazy loading para módulos pesados |
| **Startup time** | Plugins lentos degradam UX | Inicialização assíncrona, defer não-críticos |

### APIs Disponíveis

```typescript
// Manipulação de arquivos
Vault.read(file: TFile): Promise<string>
Vault.modify(file: TFile, data: string): Promise<void>
Vault.create(path: string, data: string): Promise<TFile>

// Editor
Editor.getValue(): string
Editor.setValue(content: string): void
Editor.getSelection(): string
Editor.replaceSelection(replacement: string): void
Editor.getCursor(): EditorPosition

// HTTP (bypass CORS)
requestUrl(request: RequestUrlParam): Promise<RequestUrlResponse>

// Persistência
Plugin.loadData(): Promise<any>
Plugin.saveData(data: any): Promise<void>

// UI
Plugin.addRibbonIcon()
Plugin.addCommand()
Plugin.addSettingTab()
Plugin.registerView()
```

---

## Componentes Principais

### 1. Core Plugin (`main.ts`)

**Responsabilidade:** Ponto de entrada, registro de componentes, lifecycle management.

```typescript
export default class SmartWritingCompanionPlugin extends Plugin {
    settings: SmartWritingCompanionSettings;
    orchestrator: Orchestrator;
    
    async onload() {
        await this.loadSettings();
        
        // Inicializa serviços
        this.orchestrator = new Orchestrator(this);
        
        // Registra UI
        this.registerView(VIEW_TYPE_COMPANION, (leaf) => 
            new CompanionView(leaf, this.orchestrator)
        );
        
        // Registra comandos
        this.registerCommands();
        
        // Settings tab
        this.addSettingTab(new SettingsTab(this.app, this));
    }
    
    async onunload() {
        await this.orchestrator.dispose();
    }
}
```

### 2. Orchestrator (`orchestrator/Orchestrator.ts`)

**Responsabilidade:** Coordena fluxos entre serviços, gerencia estado global, emite eventos.

```typescript
interface OrchestratorState {
    isProcessing: boolean;
    currentDocument: TFile | null;
    lastAnalysis: AnalysisResult | null;
    llmStatus: 'local' | 'cloud' | 'offline';
}

class Orchestrator extends EventEmitter {
    private state: OrchestratorState;
    private analysisService: AnalysisService;
    private cleanupService: CleanupService;
    private translationService: TranslationService;
    private llmGateway: LLMGateway;
    
    // Fluxos principais
    async analyzeDocument(file: TFile): Promise<AnalysisResult>;
    async cleanupText(text: string, options: CleanupOptions): Promise<string>;
    async translateText(text: string, from: string, to: string): Promise<string>;
    async evaluateAsPersona(text: string, persona: PersonaType): Promise<Evaluation>;
}
```

### 3. UI Layer

#### 3.1 Companion View (`views/CompanionView.ts`)

**Responsabilidade:** Sidebar com métricas em tempo real e ações rápidas.

```
┌─────────────────────────────────┐
│  📊 SmartWriting companion      │
├─────────────────────────────────┤
│                                 │
│  Documento: capitulo-01.md      │
│  ─────────────────────────      │
│                                 │
│  📝 ESTATÍSTICAS                │
│  Palavras: 12.450               │
│  Caracteres: 67.230             │
│  Parágrafos: 89                 │
│  Tempo leitura: 52 min          │
│                                 │
│  📖 LEGIBILIDADE                │
│  Flesch-Kincaid: 7.2 ✓          │
│  Gunning Fog: 9.1 ✓             │
│  ──────────────────────         │
│  ▓▓▓▓▓▓▓▓░░ Adequado            │
│                                 │
│  ⚠️ ALERTAS (3)                 │
│  • 12 advérbios em -mente       │
│  • 5 frases > 40 palavras       │
│  • 2 parágrafos > 300 palavras  │
│                                 │
│  ─────────────────────────      │
│  [🧹 Limpar] [🌐 Traduzir]      │
│  [📊 Análise Completa]          │
│                                 │
└─────────────────────────────────┘
```

#### 3.2 Analysis Modal (`views/AnalysisModal.ts`)

**Responsabilidade:** Exibe análise detalhada com abas por categoria.

#### 3.3 Persona Modal (`views/PersonaModal.ts`)

**Responsabilidade:** Avaliação do texto sob perspectiva de persona específica.

#### 3.4 Settings Tab (`settings/SettingsTab.ts`)

**Responsabilidade:** Configuração de LLM, API keys, preferências de análise.

---

## Serviços

### 4. Analysis Service (`services/AnalysisService.ts`)

**Responsabilidade:** Todas as métricas de análise textual.

```typescript
interface AnalysisResult {
    statistics: {
        words: number;
        characters: number;
        sentences: number;
        paragraphs: number;
        readingTime: number; // minutos
    };
    readability: {
        fleschKincaid: number;
        fleschReadingEase: number;
        gunningFog: number;
        smog: number;
        colemanLiau: number;
        automatedReadability: number;
    };
    style: {
        passiveVoice: StyleIssue[];
        adverbs: StyleIssue[];
        weakWords: StyleIssue[];
        longSentences: StyleIssue[];
        longParagraphs: StyleIssue[];
        repetitions: StyleIssue[];
    };
    fiction: {
        dialogueRatio: number;
        showVsTell: StyleIssue[];
        filterWords: StyleIssue[];
    };
}

interface StyleIssue {
    text: string;
    position: { line: number; ch: number };
    severity: 'info' | 'warning' | 'error';
    suggestion?: string;
}
```

**Módulos internos:**

```
AnalysisService/
├── StatisticsAnalyzer.ts    # Contagens básicas
├── ReadabilityAnalyzer.ts   # Fórmulas de legibilidade
├── StyleAnalyzer.ts         # Voz passiva, advérbios, etc.
├── FictionAnalyzer.ts       # Show vs tell, diálogos
└── ReportGenerator.ts       # Formata resultados
```

### 5. Cleanup Service (`services/CleanupService.ts`)

**Responsabilidade:** Limpeza e normalização de texto.

```typescript
interface CleanupOptions {
    normalizeQuotes: boolean;      // Aspas tipográficas
    normalizeWhitespace: boolean;  // Espaços múltiplos
    normalizeDashes: boolean;      // Travessões
    normalizeEllipsis: boolean;    // Reticências
    removeControlChars: boolean;   // Caracteres invisíveis
    fixLineBreaks: boolean;        // Quebras de linha
    preserveMarkdown: boolean;     // Manter sintaxe MD
}

interface CleanupResult {
    cleanedText: string;
    changes: CleanupChange[];
    stats: {
        totalChanges: number;
        byCategory: Record<string, number>;
    };
}
```

**Transformações:**

| Entrada | Saída | Categoria |
|---------|-------|-----------|
| `"texto"` | `"texto"` | normalizeQuotes |
| `--` | `—` | normalizeDashes |
| `...` | `…` | normalizeEllipsis |
| `\r\n` | `\n` | fixLineBreaks |
| `  ` (múltiplos) | ` ` (único) | normalizeWhitespace |
| `\u0000-\u001F` | (remove) | removeControlChars |

### 6. Translation Service (`services/TranslationService.ts`)

**Responsabilidade:** Tradução com preservação de termos de ficção.

```typescript
interface TranslationOptions {
    from: string;           // Código ISO (auto-detect se vazio)
    to: string;             // Código ISO
    preserveTerms: string[]; // Termos a não traduzir
    preserveNames: boolean;  // Detectar e preservar nomes próprios
    preserveQuotes: boolean; // Manter citações no original
    useLocal: boolean;       // Forçar modelo local
}

interface TranslationResult {
    translatedText: string;
    detectedLanguage?: string;
    preservedTerms: string[];
    confidence: number;
}
```

**Estratégia de execução:**

```
1. Detectar idioma de origem (se não especificado)
2. Extrair e marcar termos a preservar
3. Verificar disponibilidade Ollama local
   ├── Disponível → Usar modelo local (Qwen 2.5)
   └── Indisponível → Fallback para API cloud
4. Executar tradução
5. Restaurar termos preservados
6. Validar resultado
```

### 7. Persona Service (`services/PersonaService.ts`)

**Responsabilidade:** Avaliações sob perspectiva de personas leitoras.

```typescript
type PersonaType = 'booktuber' | 'hardcore-reader' | 'casual-reader';

interface PersonaEvaluation {
    persona: PersonaType;
    score: number;           // 1-5
    summary: string;         // Veredicto em uma frase
    strengths: string[];
    weaknesses: string[];
    questions: PersonaQuestion[];
    recommendation: string;
}

interface PersonaQuestion {
    question: string;
    answer: string;
}
```

**Requer LLM** — não pode rodar puramente local sem modelo de linguagem.

---

## LLM Gateway (`gateway/LLMGateway.ts`)

**Responsabilidade:** Abstração unificada para acesso a LLMs locais e cloud.

```typescript
interface LLMProvider {
    id: string;
    name: string;
    type: 'local' | 'cloud';
    isAvailable(): Promise<boolean>;
    complete(prompt: string, options: CompletionOptions): Promise<string>;
    stream(prompt: string, options: CompletionOptions): AsyncGenerator<string>;
}

interface CompletionOptions {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
    stopSequences?: string[];
}

class LLMGateway {
    private providers: Map<string, LLMProvider>;
    private preferredOrder: string[];
    private cache: LRUCache<string, string>;
    
    // Tenta providers em ordem de preferência
    async complete(prompt: string, options?: CompletionOptions): Promise<string>;
    
    // Verifica status de conexão
    async checkStatus(): Promise<LLMStatus>;
    
    // Registra novo provider
    registerProvider(provider: LLMProvider): void;
}
```

### Providers Implementados

#### 7.1 Ollama Provider (`gateway/providers/OllamaProvider.ts`)

```typescript
class OllamaProvider implements LLMProvider {
    id = 'ollama';
    name = 'Ollama (Local)';
    type = 'local' as const;
    
    private baseUrl = 'http://127.0.0.1:11434';
    private model: string; // Configurável: qwen2.5:7b, llama3.1:8b, etc.
    
    async isAvailable(): Promise<boolean> {
        try {
            const response = await requestUrl({
                url: `${this.baseUrl}/api/tags`,
                method: 'GET'
            });
            return response.status === 200;
        } catch {
            return false;
        }
    }
    
    async complete(prompt: string, options: CompletionOptions): Promise<string> {
        const response = await requestUrl({
            url: `${this.baseUrl}/api/generate`,
            method: 'POST',
            body: JSON.stringify({
                model: this.model,
                prompt: this.buildPrompt(prompt, options),
                stream: false,
                options: {
                    num_predict: options.maxTokens ?? 2048,
                    temperature: options.temperature ?? 0.7
                }
            })
        });
        return response.json.response;
    }
}
```

#### 7.2 Gemini Provider (`gateway/providers/GeminiProvider.ts`)

```typescript
class GeminiProvider implements LLMProvider {
    id = 'gemini';
    name = 'Google Gemini';
    type = 'cloud' as const;
    
    private apiKey: string;
    private model = 'gemini-2.5-flash';
    
    async complete(prompt: string, options: CompletionOptions): Promise<string> {
        const response = await requestUrl({
            url: `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': this.apiKey
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: options.maxTokens ?? 2048,
                    temperature: options.temperature ?? 0.7
                }
            })
        });
        return response.json.candidates[0].content.parts[0].text;
    }
}
```

#### 7.3 OpenAI Provider (`gateway/providers/OpenAIProvider.ts`)

Implementação similar para OpenAI/Claude APIs.

---

## Analyzers (Processamento Local)

Módulos que rodam **100% localmente** sem dependência de LLM.

### 8. Readability Analyzer (`analyzers/ReadabilityAnalyzer.ts`)

**Dependências:** `text-readability`

```typescript
import * as readability from 'text-readability';

class ReadabilityAnalyzer {
    analyze(text: string): ReadabilityMetrics {
        return {
            fleschKincaid: readability.fleschKincaidGrade(text),
            fleschReadingEase: readability.fleschReadingEase(text),
            gunningFog: readability.gunningFog(text),
            smog: readability.smogIndex(text),
            colemanLiau: readability.colemanLiauIndex(text),
            automatedReadability: readability.automatedReadabilityIndex(text),
            daleChall: readability.daleChallReadabilityScore(text)
        };
    }
    
    getGradeLevel(metrics: ReadabilityMetrics): string {
        const avg = (metrics.fleschKincaid + metrics.gunningFog) / 2;
        if (avg <= 6) return 'Elementar';
        if (avg <= 9) return 'Intermediário';
        if (avg <= 12) return 'Avançado';
        return 'Acadêmico';
    }
}
```

### 9. Style Analyzer (`analyzers/StyleAnalyzer.ts`)

**Dependências:** `compromise`

```typescript
import nlp from 'compromise';

class StyleAnalyzer {
    // Detecta voz passiva
    findPassiveVoice(text: string): StyleIssue[] {
        const doc = nlp(text);
        const passives = doc.sentences().filter(s => s.has('#Passive'));
        return passives.map(p => ({
            text: p.text(),
            position: this.getPosition(text, p.text()),
            severity: 'warning',
            suggestion: 'Considere reescrever em voz ativa'
        }));
    }
    
    // Detecta advérbios em -mente
    findAdverbs(text: string): StyleIssue[] {
        const doc = nlp(text);
        const adverbs = doc.adverbs().out('array');
        return adverbs
            .filter(adv => adv.endsWith('mente') || adv.endsWith('ly'))
            .map(adv => ({
                text: adv,
                position: this.getPosition(text, adv),
                severity: 'info',
                suggestion: 'Advérbios enfraquecem a prosa'
            }));
    }
    
    // Detecta palavras-filtro (ficção)
    findFilterWords(text: string): StyleIssue[] {
        const filterWords = [
            'viu', 'ouviu', 'sentiu', 'percebeu', 'notou',
            'pensou', 'soube', 'imaginou', 'lembrou'
        ];
        // ... implementação
    }
    
    // Detecta frases longas
    findLongSentences(text: string, maxWords = 40): StyleIssue[] {
        const sentences = text.split(/[.!?]+/);
        return sentences
            .filter(s => s.split(/\s+/).length > maxWords)
            .map(s => ({
                text: s.trim(),
                position: this.getPosition(text, s),
                severity: 'warning',
                suggestion: `Frase com ${s.split(/\s+/).length} palavras. Considere dividir.`
            }));
    }
}
```

### 10. Text Cleanup (`analyzers/TextCleanup.ts`)

**Dependências:** Nativo + `smartquotes`

```typescript
class TextCleanup {
    private rules: CleanupRule[] = [
        // Aspas tipográficas
        { pattern: /"([^"]+)"/g, replacement: '"$1"', category: 'quotes' },
        { pattern: /'([^']+)'/g, replacement: ''$1'', category: 'quotes' },
        
        // Travessões
        { pattern: /--/g, replacement: '—', category: 'dashes' },
        { pattern: / - /g, replacement: ' — ', category: 'dashes' },
        
        // Reticências
        { pattern: /\.{3,}/g, replacement: '…', category: 'ellipsis' },
        
        // Espaços
        { pattern: /[ \t]+/g, replacement: ' ', category: 'whitespace' },
        { pattern: /\n{3,}/g, replacement: '\n\n', category: 'whitespace' },
        
        // Caracteres de controle
        { pattern: /[\x00-\x08\x0B\x0C\x0E-\x1F]/g, replacement: '', category: 'control' }
    ];
    
    cleanup(text: string, options: CleanupOptions): CleanupResult {
        let result = text;
        const changes: CleanupChange[] = [];
        
        for (const rule of this.rules) {
            if (this.isRuleEnabled(rule, options)) {
                const matches = result.matchAll(rule.pattern);
                for (const match of matches) {
                    changes.push({
                        original: match[0],
                        replacement: rule.replacement,
                        category: rule.category,
                        position: match.index
                    });
                }
                result = result.replace(rule.pattern, rule.replacement);
            }
        }
        
        return { cleanedText: result, changes, stats: this.computeStats(changes) };
    }
}
```

---

## Fluxo de Dados

### Análise de Documento

```
┌──────────────┐
│ User Action  │ → Cmd+Shift+A ou botão na sidebar
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Orchestrator │ → analyzeDocument(file)
└──────┬───────┘
       │
       ├──────────────────────────────────────┐
       │                                      │
       ▼                                      ▼
┌──────────────┐                    ┌──────────────────┐
│ Vault.read() │                    │ Analysis Service │
│   (async)    │                    │                  │
└──────┬───────┘                    │ ┌──────────────┐ │
       │                            │ │ Statistics   │ │ ← Executa em paralelo
       │                            │ │ Analyzer     │ │
       │                            │ └──────────────┘ │
       │                            │ ┌──────────────┐ │
       └───────────────────────────▶│ │ Readability  │ │
                                    │ │ Analyzer     │ │
                                    │ └──────────────┘ │
                                    │ ┌──────────────┐ │
                                    │ │ Style        │ │
                                    │ │ Analyzer     │ │
                                    │ └──────────────┘ │
                                    └────────┬─────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │ Report Generator │
                                    └────────┬─────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │ CompanionView    │
                                    │ (atualiza UI)    │
                                    └──────────────────┘
```

### Avaliação por Persona (requer LLM)

```
┌──────────────┐
│ User Action  │ → "Avaliar como booktuber"
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Orchestrator │ → evaluateAsPersona(text, 'booktuber')
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Persona Service  │
│                  │
│ 1. Carrega       │
│    prompt da     │
│    persona       │
│                  │
│ 2. Prepara       │
│    contexto      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   LLM Gateway    │
│                  │
│ Ordem de         │
│ tentativa:       │
│                  │
│ 1. Ollama local  │──── Disponível? ──── Sim ──▶ Usa local
│ 2. Gemini API    │         │
│ 3. OpenAI API    │        Não
│ 4. Erro          │         │
│                  │         ▼
│                  │    Próximo provider
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Persona Modal    │
│ (exibe resultado)│
└──────────────────┘
```

---

## Estrutura de Arquivos

```
smart-writing-companion/
│
├── src/
│   ├── main.ts                      # Entry point do plugin
│   │
│   ├── types/
│   │   ├── index.ts                 # Exports centralizados
│   │   ├── analysis.ts              # Tipos de análise
│   │   ├── cleanup.ts               # Tipos de limpeza
│   │   ├── translation.ts           # Tipos de tradução
│   │   ├── persona.ts               # Tipos de persona
│   │   └── settings.ts              # Tipos de configuração
│   │
│   ├── orchestrator/
│   │   ├── Orchestrator.ts          # Coordenador principal
│   │   └── EventBus.ts              # Sistema de eventos
│   │
│   ├── services/
│   │   ├── AnalysisService.ts       # Serviço de análise
│   │   ├── CleanupService.ts        # Serviço de limpeza
│   │   ├── TranslationService.ts    # Serviço de tradução
│   │   └── PersonaService.ts        # Serviço de personas
│   │
│   ├── analyzers/
│   │   ├── StatisticsAnalyzer.ts    # Contagens
│   │   ├── ReadabilityAnalyzer.ts   # Métricas de legibilidade
│   │   ├── StyleAnalyzer.ts         # Análise de estilo
│   │   ├── FictionAnalyzer.ts       # Análise para ficção
│   │   └── TextCleanup.ts           # Limpeza de texto
│   │
│   ├── gateway/
│   │   ├── LLMGateway.ts            # Gateway principal
│   │   ├── LLMProvider.ts           # Interface de provider
│   │   ├── LRUCache.ts              # Cache de respostas
│   │   └── providers/
│   │       ├── OllamaProvider.ts    # Provider local
│   │       ├── GeminiProvider.ts    # Google Gemini
│   │       ├── OpenAIProvider.ts    # OpenAI/ChatGPT
│   │       └── AnthropicProvider.ts # Claude
│   │
│   ├── views/
│   │   ├── CompanionView.ts         # Sidebar principal
│   │   ├── OnboardingView.ts        # Tela de primeiro uso
│   │   └── components/
│   │       ├── Header.ts            # Header com status indicator
│   │       ├── StatusIndicator.ts   # 🟢🟡🔴 status de conexão
│   │       ├── DocumentCard.ts      # Info do documento ativo
│   │       ├── MetricsPanel.ts      # Painel de métricas
│   │       ├── ActionsGrid.ts       # Grid de botões de ação
│   │       ├── ContextIndicator.ts  # "Agindo sobre: X"
│   │       ├── PersonaCards.ts      # Cards de personas
│   │       ├── ActivityFeed.ts      # Container de blobs
│   │       └── blobs/
│   │           ├── BaseBlob.ts      # Componente base
│   │           ├── SuggestionBlob.ts # Sugestões pendentes
│   │           ├── EvaluationBlob.ts # Avaliação persona
│   │           ├── TranslationBlob.ts # Tradução pronta
│   │           ├── ConfirmationBlob.ts # Ação concluída
│   │           ├── ErrorBlob.ts     # Erros
│   │           └── ProcessingBlob.ts # Em andamento
│   │
│   ├── settings/
│   │   ├── SettingsTab.ts           # Tab de configurações
│   │   ├── SettingsManager.ts       # Gerenciador de config
│   │   └── defaults.ts              # Valores padrão
│   │
│   ├── prompts/
│   │   ├── personas/
│   │   │   ├── booktuber.md         # Prompt booktuber
│   │   │   ├── hardcore.md          # Prompt leitor contumaz
│   │   │   └── casual.md            # Prompt leitor casual
│   │   ├── translation.md           # Prompt de tradução
│   │   └── analysis.md              # Prompt de análise LLM
│   │
│   └── utils/
│       ├── textUtils.ts             # Utilitários de texto
│       ├── markdownUtils.ts         # Parser de markdown
│       └── debounce.ts              # Debounce/throttle
│
├── src/editor/
│   ├── SuggestionManager.ts         # Gerencia sugestões no editor
│   ├── SuggestionDecorations.ts     # Highlights inline
│   ├── SuggestionTooltip.ts         # Tooltip aceitar/rejeitar
│   └── EditorExtension.ts           # CodeMirror extension
│
├── src/commands/
│   └── commands.ts                  # Todos os comandos do plugin
│
├── styles/
│   ├── main.css                     # Estilos principais
│   ├── tokens.css                   # Design tokens (--swc-*)
│   ├── sidebar.css                  # Estilos da sidebar
│   ├── blobs.css                    # Estilos dos blobs
│   └── suggestions.css              # Estilos das sugestões inline
│
├── manifest.json                    # Manifest do Obsidian
├── package.json                     # Dependências
├── tsconfig.json                    # Config TypeScript
├── esbuild.config.mjs               # Config de build
│
└── docs/
    ├── ARCHITECTURE.md              # Este documento
    ├── CONTRIBUTING.md              # Guia de contribuição
    └── API.md                       # Documentação da API
```

---

## Commands (Command Palette)

O plugin registra os seguintes comandos no Obsidian:

```typescript
const COMMANDS = [
    // Ações principais
    { id: 'clean-document', name: 'Limpar documento' },
    { id: 'clean-selection', name: 'Limpar seleção' },
    { id: 'analyze-document', name: 'Analisar documento' },
    { id: 'analyze-selection', name: 'Analisar seleção' },
    { id: 'translate-to-pt', name: 'Traduzir para português' },
    { id: 'translate-to-en', name: 'Traduzir para inglês' },
    
    // Personas
    { id: 'evaluate-booktuber', name: 'Avaliar como Booktuber' },
    { id: 'evaluate-hardcore', name: 'Avaliar como Leitor Contumaz' },
    { id: 'evaluate-casual', name: 'Avaliar como Leitor Casual' },
    
    // UI
    { id: 'open-companion', name: 'Abrir painel companion' },
    { id: 'toggle-companion', name: 'Alternar painel companion' },
    
    // Sugestões
    { id: 'accept-all-suggestions', name: 'Aceitar todas as sugestões' },
    { id: 'reject-all-suggestions', name: 'Rejeitar todas as sugestões' },
    { id: 'next-suggestion', name: 'Próxima sugestão' },
    { id: 'prev-suggestion', name: 'Sugestão anterior' },
    
    // Sistema
    { id: 'check-llm-connection', name: 'Verificar conexão LLM' },
];
```

### Atalhos de Teclado Padrão

| Comando | Atalho Sugerido |
|---------|-----------------|
| Abrir painel | `Cmd/Ctrl+Shift+W` |
| Limpar seleção/documento | `Cmd/Ctrl+Shift+C` |
| Próxima sugestão | `Tab` (quando há sugestões) |
| Aceitar sugestão | `Enter` (quando focado) |
| Rejeitar sugestão | `Backspace` (quando focado) |

---

## Gerenciamento de Estado

### Estado Global (Plugin Settings)

```typescript
interface SmartWritingCompanionSettings {
    // LLM
    llm: {
        preferLocal: boolean;
        ollamaModel: string;
        ollamaUrl: string;
        geminiApiKey: string;
        openaiApiKey: string;
        defaultProvider: 'ollama' | 'gemini' | 'openai' | 'auto';
    };
    
    // Análise
    analysis: {
        autoAnalyze: boolean;           // Analisar ao abrir arquivo
        analysisDelay: number;          // Debounce em ms
        showInStatusBar: boolean;
        
        // Thresholds (SF/Fantasy defaults)
        maxSentenceLength: number;      // 40
        maxParagraphLength: number;     // 300
        targetFleschKincaid: number;    // 7-9
        targetPassiveVoice: number;     // 5%
    };
    
    // Limpeza
    cleanup: {
        normalizeQuotes: boolean;
        normalizeDashes: boolean;
        normalizeEllipsis: boolean;
        normalizeWhitespace: boolean;
        preserveMarkdown: boolean;
    };
    
    // Tradução
    translation: {
        defaultSourceLang: string;
        defaultTargetLang: string;
        preserveNames: boolean;
        customTerms: string[];
    };
    
    // UI
    ui: {
        sidebarPosition: 'left' | 'right';
        defaultView: 'metrics' | 'alerts' | 'full';
        theme: 'auto' | 'light' | 'dark';
    };
}
```

### Estado de Sessão (Runtime)

```typescript
interface SessionState {
    // Status atual
    isProcessing: boolean;
    processingTask: 'analysis' | 'cleanup' | 'translation' | 'persona' | null;
    progress: number; // 0-100
    
    // Cache de análise (por arquivo)
    analysisCache: Map<string, {
        result: AnalysisResult;
        timestamp: number;
        hash: string; // Hash do conteúdo
    }>;
    
    // LLM status
    llmStatus: {
        ollama: 'connected' | 'disconnected' | 'checking';
        gemini: 'ready' | 'no-key' | 'error';
        openai: 'ready' | 'no-key' | 'error';
    };
    
    // Último documento analisado
    currentFile: TFile | null;
    currentAnalysis: AnalysisResult | null;
}
```

---

## Decisões Arquiteturais (ADRs)

### ADR-001: Camadas de Serviço vs. Monólito

**Contexto:** Plugin poderia ser um único arquivo ou estrutura modular.

**Decisão:** Arquitetura em camadas com serviços especializados.

**Justificativa:**
- Testabilidade: cada serviço pode ser testado isoladamente
- Manutenibilidade: mudanças localizadas
- Extensibilidade: novos analyzers ou providers adicionados facilmente
- Separação de responsabilidades clara

**Trade-off:** Bundle maior, mais arquivos para gerenciar.

---

### ADR-002: LLM Gateway com Fallback Automático

**Contexto:** Usuários podem ter Ollama local, apenas API cloud, ou ambos.

**Decisão:** Gateway abstrai providers com ordem de preferência configurável e fallback automático.

**Justificativa:**
- UX consistente independente de configuração
- Resiliência: se local falha, cloud assume
- Flexibilidade: usuário escolhe preferência
- Custo: priorizar local reduz uso de API paga

**Ordem padrão:** Ollama → Gemini (free tier) → OpenAI

---

### ADR-003: Análise Local-First

**Contexto:** Métricas de legibilidade e estilo podem usar LLM ou bibliotecas locais.

**Decisão:** Usar bibliotecas JavaScript para métricas determinísticas; reservar LLM apenas para tarefas que exigem compreensão semântica.

**Justificativa:**
- Performance: análise instantânea sem latência de rede
- Privacidade: texto nunca sai do dispositivo
- Consistência: mesma entrada = mesma saída
- Custo: zero uso de tokens

**LLM reservado para:**
- Avaliação por persona (requer julgamento)
- Tradução (preservação de contexto)
- Show vs Tell avançado (requer compreensão narrativa)

---

### ADR-004: Processamento Incremental

**Contexto:** Documentos de 50k+ palavras podem travar a UI.

**Decisão:** Análise em chunks com Web Workers para operações pesadas.

**Justificativa:**
- Responsividade: UI permanece fluida
- Progresso: usuário vê andamento
- Cancelável: operações longas podem ser interrompidas

**Implementação:**
```typescript
// Processa em chunks de 5000 palavras
const CHUNK_SIZE = 5000;

async function analyzeInChunks(text: string, onProgress: (n: number) => void) {
    const chunks = splitIntoChunks(text, CHUNK_SIZE);
    const results = [];
    
    for (let i = 0; i < chunks.length; i++) {
        results.push(await analyzeChunk(chunks[i]));
        onProgress((i + 1) / chunks.length * 100);
    }
    
    return mergeResults(results);
}
```

---

### ADR-005: Cache de Resultados

**Contexto:** Reanalisar documento a cada keystroke é desperdício.

**Decisão:** Cache baseado em hash do conteúdo + debounce de 2 segundos.

**Justificativa:**
- Performance: evita recomputação desnecessária
- UX: atualizações não interrompem escrita
- Recursos: reduz uso de CPU

**Invalidação:**
- Hash do documento muda
- Configurações de análise mudam
- Cache expira (1 hora)

---

## Dependências de Produção

```json
{
  "dependencies": {
    "text-readability": "^1.0.5",
    "compromise": "^14.10.0",
    "tinyld": "^1.3.4",
    "reading-time": "^1.5.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "obsidian": "latest",
    "typescript": "^5.0.0",
    "esbuild": "^0.19.0"
  }
}
```

**Bundle estimado:** ~180KB gzipped (sem modelos de LLM local)

---

## Considerações de Performance

| Operação | Target | Estratégia |
|----------|--------|------------|
| Análise de estatísticas | < 100ms para 50k palavras | Processamento incremental |
| Análise de legibilidade | < 200ms para 50k palavras | text-readability otimizado |
| Análise de estilo | < 500ms para 50k palavras | Web Worker |
| Limpeza de texto | < 100ms para 50k palavras | Regex compilado |
| LLM local (Ollama) | < 5s para resposta | Streaming |
| LLM cloud | < 3s para resposta | Async com indicador |

### Otimizações Implementadas

1. **Lazy loading:** Views e modais carregados sob demanda
2. **Debounce:** Análise automática aguarda 2s de inatividade
3. **Memoização:** Resultados cacheados por hash de conteúdo
4. **Streaming:** Respostas LLM aparecem progressivamente
5. **Web Workers:** Análise pesada não bloqueia UI

---

## Estratégia de Testes

### Unitários

```typescript
// analyzers/ReadabilityAnalyzer.test.ts
describe('ReadabilityAnalyzer', () => {
    it('should calculate Flesch-Kincaid correctly', () => {
        const text = 'The cat sat on the mat.';
        const result = analyzer.analyze(text);
        expect(result.fleschKincaid).toBeCloseTo(1.8, 1);
    });
});
```

### Integração

```typescript
// services/AnalysisService.test.ts
describe('AnalysisService', () => {
    it('should combine all analyzers correctly', async () => {
        const result = await service.analyze(sampleText);
        expect(result.statistics).toBeDefined();
        expect(result.readability).toBeDefined();
        expect(result.style).toBeDefined();
    });
});
```

### E2E (Manual)

Checklist para release:
- [ ] Plugin carrega sem erros
- [ ] Sidebar exibe métricas corretamente
- [ ] Limpeza não corrompe markdown
- [ ] Tradução preserva nomes próprios
- [ ] Fallback cloud funciona quando Ollama offline
- [ ] Performance aceitável em documento de 100k palavras

---

## Roadmap de Implementação

### Fase 1: Core Infrastructure (Semana 1-2)

- [ ] Setup do projeto (esbuild, TypeScript, manifest)
- [ ] Estrutura de arquivos base
- [ ] Settings tab com configuração de LLM
- [ ] LLM Gateway com Ollama provider

### Fase 2: Análise Local (Semana 3-4)

- [ ] StatisticsAnalyzer
- [ ] ReadabilityAnalyzer
- [ ] StyleAnalyzer básico
- [ ] CompanionView (sidebar)

### Fase 3: Limpeza e UI (Semana 5-6)

- [ ] TextCleanup completo
- [ ] CleanupModal
- [ ] AnalysisModal
- [ ] Integração com editor

### Fase 4: LLM Features (Semana 7-8)

- [ ] PersonaService
- [ ] TranslationService
- [ ] Providers cloud (Gemini, OpenAI)
- [ ] PersonaModal e TranslationModal

### Fase 5: Polish e Release (Semana 9-10)

- [ ] Testes abrangentes
- [ ] Documentação
- [ ] Performance optimization
- [ ] Submissão ao Community Plugins

---

_Documento versão 1.0 — Dezembro 2024_  
_Projeto: SmartWriting companion_  
_Repositório: [github.com/zandercpzed/text_companion](https://github.com/zandercpzed/text_companion)_
