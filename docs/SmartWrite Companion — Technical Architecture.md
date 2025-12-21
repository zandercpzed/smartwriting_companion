## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         OBSIDIAN HOST                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐      ┌──────────────────────────────────────┐ │
│  │                 │      │         SmartWrite Plugin            │ │
│  │   Obsidian      │      │  ┌────────────────────────────────┐  │ │
│  │   Editor        │◄────►│  │         Sidebar View           │  │ │
│  │   (CodeMirror)  │      │  │  ┌────────┬────────┬────────┐  │  │ │
│  │                 │      │  │  │ Stats  │Suggest.│Persona │  │  │ │
│  │                 │      │  │  │ Panel  │ Panel  │ Panel  │  │  │ │
│  │                 │      │  │  └────────┴────────┴────────┘  │  │ │
│  └─────────────────┘      │  └────────────────────────────────┘  │ │
│          │                │                  │                    │ │
│          │                └──────────────────┼────────────────────┘ │
│          │                                   │                      │
│          ▼                                   ▼                      │
│  ┌─────────────────┐              ┌─────────────────┐              │
│  │  Vault Storage  │              │   Core Engine   │              │
│  │  (Settings,     │              │  ┌───────────┐  │              │
│  │   Cache)        │              │  │TextAnalyzer│  │              │
│  └─────────────────┘              │  │StatsEngine│  │              │
│                                   │  │Suggestion │  │              │
│                                   │  └───────────┘  │              │
│                                   └────────┬────────┘              │
│                                            │                        │
└────────────────────────────────────────────┼────────────────────────┘
                                             │
                                             ▼
                                   ┌─────────────────┐
                                   │     Ollama      │
                                   │  localhost:11434│
                                   │  ┌───────────┐  │
                                   │  │ LLM Model │  │
                                   │  └───────────┘  │
                                   └─────────────────┘
```

---

## 2. Directory Structure

```
smartwrite-companion/
├── manifest.json              # Obsidian plugin manifest
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── esbuild.config.mjs         # Build config
├── styles.css                 # Global styles
│
├── src/
│   ├── main.ts                # Plugin entry point
│   ├── settings.ts            # Settings management
│   ├── types.ts               # TypeScript interfaces
│   │
│   ├── core/
│   │   ├── TextAnalyzer.ts    # Text parsing and analysis
│   │   ├── StatsEngine.ts     # Statistics calculations
│   │   ├── SuggestionEngine.ts# Writing suggestions
│   │   ├── ReadabilityEngine.ts# Readability formulas
│   │   └── SessionTracker.ts  # Writing session management
│   │
│   ├── services/
│   │   ├── OllamaService.ts   # Local LLM communication
│   │   ├── PersonaManager.ts  # Persona orchestration
│   │   └── CacheService.ts    # Analysis caching
│   │
│   ├── ui/
│   │   ├── SidebarView.ts     # Main sidebar container
│   │   ├── components/
│   │   │   ├── StatsPanel.ts
│   │   │   ├── SuggestionsPanel.ts
│   │   │   ├── PersonaPanel.ts
│   │   │   └── SettingsTab.ts
│   │   └── styles/
│   │       ├── sidebar.css
│   │       ├── panels.css
│   │       └── themes.css
│   │
│   ├── personas/
│   │   ├── BasePersona.ts
│   │   ├── prompts/
│   │   │   ├── critical-editor.md
│   │   │   ├── common-reader.md
│   │   │   ├── technical-reviewer.md
│   │   │   ├── devils-advocate.md
│   │   │   ├── booktuber.md
│   │   │   ├── fandom.md
│   │   │   └── avid-reader.md
│   │   └── PersonaFactory.ts
│   │
│   ├── i18n/
│   │   ├── index.ts           # i18n loader
│   │   └── locales/
│   │       ├── en.json
│   │       ├── pt.json
│   │       ├── es.json
│   │       ├── fr.json
│   │       ├── de.json
│   │       └── ...            # Additional languages
│   │
│   └── utils/
│       ├── debounce.ts
│       ├── hash.ts
│       └── textUtils.ts
│
├── data/
│   ├── locales/
│   │   ├── pt/
│   │   │   ├── cliches.json
│   │   │   ├── passive-patterns.json
│   │   │   └── abbreviations.json
│   │   ├── en/
│   │   │   ├── cliches.json
│   │   │   ├── passive-patterns.json
│   │   │   └── abbreviations.json
│   │   ├── es/
│   │   │   └── ...
│   │   ├── fr/
│   │   │   └── ...
│   │   └── de/
│   │       └── ...
│
└── tests/
    ├── core/
    ├── services/
    └── fixtures/
```

---

## 3. Core Components

### 3.1 TextAnalyzer

Parses raw text and extracts metrics.

```typescript
interface TextMetrics {
    text: string
    words: string[]
    sentences: string[]
    paragraphs: string[]
    syllables: number
    characters: number
    charactersNoSpaces: number
}

class TextAnalyzer {
    constructor(
        private sentenceDetector: SentenceDetector,
        private syllableCounter: SyllableCounter
    ) {}

    analyze(text: string, language: Language): TextMetrics
    getWordFrequency(words: string[]): Map<string, number>
    findRepetitions(words: string[], threshold: number): Repetition[]
}
```

### 3.2 StatsEngine

Calculates statistics from TextMetrics.

```typescript
interface TextStats {
    wordCount: number
    charCount: number
    charCountNoSpaces: number
    sentenceCount: number
    paragraphCount: number
    avgWordsPerSentence: number
    avgSyllablesPerWord: number
    uniqueWords: number
    readingTimeMinutes: number
    readability: ReadabilityScores
}

interface ReadabilityScores {
    fleschReadingEase: number
    fleschKincaid: number
    gunningFog: number
    smog: number
    colemanLiau: number
    ari: number
    daleChall: number
    linsearWrite: number
    fleschPTBR?: number // Portuguese only
    gulpease?: number // Portuguese only
}
```

### 3.3 SuggestionEngine

Detects writing issues and generates suggestions.

```typescript
interface Suggestion {
    type: SuggestionType
    severity: 'info' | 'warning' | 'error'
    message: string
    range: { start: number; end: number }
    replacements?: string[]
}

enum SuggestionType {
    REPEATED_WORD,
    LONG_SENTENCE,
    DENSE_PARAGRAPH,
    PASSIVE_VOICE,
    EXCESSIVE_ADVERB,
    CLICHE,
    REDUNDANCY,
}

class SuggestionEngine {
    constructor(
        private config: SuggestionConfig,
        private language: Language
    ) {}

    analyze(metrics: TextMetrics): Suggestion[]
}
```

### 3.4 OllamaService

Communicates with local Ollama instance.

```typescript
interface OllamaConfig {
    endpoint: string // default: http://localhost:11434
    model: string // e.g., llama3.2, mistral
    timeout: number // ms
}

interface GenerateOptions {
    prompt: string
    system?: string
    temperature?: number
    maxTokens?: number
}

class OllamaService {
    constructor(private config: OllamaConfig) {}

    async checkHealth(): Promise<boolean>
    async listModels(): Promise<string[]>
    async generate(options: GenerateOptions): Promise<string>
    async generateStream(options: GenerateOptions): AsyncGenerator<string>
}
```

---

## 4. Data Flow

### 4.1 Real-Time Analysis

```
Editor Change Event
        │
        ▼ (300ms debounce)
┌───────────────────┐
│   TextAnalyzer    │
│   .analyze()      │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐     ┌───────────────────┐
│   StatsEngine     │     │ SuggestionEngine  │
│   .calculate()    │     │   .analyze()      │
└────────┬──────────┘     └────────┬──────────┘
         │                         │
         └──────────┬──────────────┘
                    ▼
         ┌───────────────────┐
         │   Sidebar View    │
         │   .update()       │
         └───────────────────┘
```

### 4.2 LLM Analysis

```
User Click "Analyze"
        │
        ▼
┌───────────────────┐
│  PersonaManager   │
│  .selectPersona() │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  CacheService     │
│  .checkCache()    │──────► Cache Hit ──► Return cached
└────────┬──────────┘
         │ Cache Miss
         ▼
┌───────────────────┐
│  OllamaService    │
│  .generate()      │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  CacheService     │
│  .store()         │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  PersonaPanel     │
│  .displayResult() │
└───────────────────┘
```

---

## 5. Dependencies

### 5.1 Production Dependencies

```json
{
    "dependencies": {
        "text-readability": "^1.0.5",
        "hyphen": "^1.6.4",
        "sbd": "^1.0.19",
        "@nlpjs/core": "^4.26.1",
        "@nlpjs/lang-pt": "^4.26.1",
        "@nlpjs/lang-en": "^4.26.1",
        "@nlpjs/lang-es": "^4.26.1",
        "@nlpjs/lang-fr": "^4.26.1",
        "@nlpjs/lang-de": "^4.26.1",
        "write-good": "^1.0.8",
        "moby": "^1.0.0"
    }
}
```

### 5.2 Development Dependencies

```json
{
    "devDependencies": {
        "@types/node": "^20.10.0",
        "typescript": "^5.3.0",
        "esbuild": "^0.19.0",
        "obsidian": "^1.4.0",
        "vitest": "^1.0.0",
        "@vitest/coverage-v8": "^1.0.0"
    }
}
```

### 5.3 Dependency Matrix

| Library            | Purpose                   | Multilingual  | Size        |
| ------------------ | ------------------------- | :-----------: | ----------- |
| `text-readability` | Readability formulas (EN) |    EN only    | ~50KB       |
| `hyphen`           | Syllable counting         | 70+ languages | ~200KB      |
| `sbd`              | Sentence detection        | Configurable  | ~15KB       |
| `@nlpjs/lang-*`    | NLP per language          | 40+ languages | ~100KB each |
| `write-good`       | Writing quality           |    EN only    | ~30KB       |
| `moby`             | Thesaurus                 |    EN only    | ~5MB        |

### 5.4 Custom Implementations Required

| Feature                | Reason                  | Approach                                      |
| ---------------------- | ----------------------- | --------------------------------------------- |
| Readability (non-EN)   | Limited library support | Custom formulas per language + `hyphen`       |
| Passive voice (non-EN) | No library exists       | Regex patterns + verb lists per language      |
| Clichés (non-EN)       | No library exists       | Custom JSON dictionaries per language         |
| Thesaurus (non-EN)     | No library exists       | OpenThesaurus data or equivalent per language |

**Supported languages (initial):** EN, PT, ES, FR, DE  
**Extensible:** Additional languages via locale files + NLP.js packages

---

## 6. External Requirements

### 6.1 Ollama

| Requirement     | Minimum  | Recommended               |
| --------------- | -------- | ------------------------- |
| RAM (3B models) | 4GB      | 8GB                       |
| RAM (7B models) | 8GB      | 16GB                      |
| Disk            | 5GB      | 20GB                      |
| GPU             | Optional | NVIDIA/AMD with CUDA/ROCm |

**Supported models:**

| Model     | Size | Quality | Speed | Command                   |
| --------- | ---- | ------- | ----- | ------------------------- |
| Llama 3.2 | 3B   | ★★★☆    | ★★★★  | `ollama pull llama3.2`    |
| Llama 3.2 | 8B   | ★★★★    | ★★★☆  | `ollama pull llama3.2:8b` |
| Mistral   | 7B   | ★★★★    | ★★★☆  | `ollama pull mistral`     |
| Phi-3     | 3.8B | ★★★☆    | ★★★★  | `ollama pull phi3`        |
| Qwen 2.5  | 7B   | ★★★★    | ★★★☆  | `ollama pull qwen2.5`     |

---

## 7. Configuration

### 7.1 Settings Interface

```typescript
interface SmartWriteSettings {
    // Analysis
    language: string // ISO 639-1 code (e.g., 'en', 'pt', 'es', 'fr')
    debounceMs: number // default: 300

    // Statistics
    dailyWordGoal: number // default: 1000
    readingSpeed: number // wpm, default: 200

    // Suggestions
    maxSentenceLength: number // default: 30
    maxParagraphSentences: number // default: 6
    repetitionThreshold: number // default: 3
    enablePassiveVoice: boolean
    enableClicheDetection: boolean

    // Readability
    primaryReadability: ReadabilityMethod
    showAllScores: boolean

    // Ollama
    ollamaEndpoint: string // default: http://localhost:11434
    ollamaModel: string // default: llama3.2
    ollamaTimeout: number // ms, default: 60000

    // Personas
    enabledPersonas: PersonaId[]
    customPersonas: CustomPersonaConfig[]
    autoAnalyze: boolean
    autoAnalyzeThreshold: number // paragraphs

    // UI
    sidebarPosition: 'left' | 'right'
    compactMode: boolean
    showInStatusBar: boolean
}
```

### 7.2 Default Configuration

```typescript
const DEFAULT_SETTINGS: SmartWriteSettings = {
    language: 'en', // Auto-detect or user preference
    debounceMs: 300,
    dailyWordGoal: 1000,
    readingSpeed: 200,
    maxSentenceLength: 30,
    maxParagraphSentences: 6,
    repetitionThreshold: 3,
    enablePassiveVoice: true,
    enableClicheDetection: true,
    primaryReadability: 'flesch-kincaid',
    showAllScores: false,
    ollamaEndpoint: 'http://localhost:11434',
    ollamaModel: 'llama3.2',
    ollamaTimeout: 60000,
    enabledPersonas: ['critical-editor', 'common-reader'],
    customPersonas: [],
    autoAnalyze: false,
    autoAnalyzeThreshold: 5,
    sidebarPosition: 'right',
    compactMode: false,
    showInStatusBar: true,
}
```

---

## 8. Build & Development

### 8.1 Scripts

```json
{
    "scripts": {
        "dev": "node esbuild.config.mjs",
        "build": "node esbuild.config.mjs production",
        "test": "vitest",
        "test:coverage": "vitest --coverage",
        "lint": "eslint src/",
        "typecheck": "tsc --noEmit"
    }
}
```

### 8.2 Build Output

```
dist/
├── main.js          # Bundled plugin (~500KB)
├── manifest.json
└── styles.css
```

---

## 9. Performance Considerations

| Operation         | Target | Strategy                      |
| ----------------- | ------ | ----------------------------- |
| Text analysis     | <50ms  | Debounce, incremental updates |
| Stats calculation | <10ms  | Memoization                   |
| Suggestion scan   | <100ms | Lazy evaluation               |
| LLM response      | <30s   | Streaming, caching            |
| UI update         | <16ms  | Virtual DOM diffing           |

### 9.1 Caching Strategy

```typescript
interface CacheEntry {
  hash: string;           // MD5 of text content
  timestamp: number;
  ttl: number;            // Time to live in ms
  result: AnalysisResult;
}

// Cache invalidation
- Text change: Invalidate stats cache
- Settings change: Invalidate suggestions cache
- Manual trigger: Invalidate LLM cache
```

---

## 10. API Reference

### 10.1 Ollama Endpoints Used

| Endpoint        | Method | Purpose                       |
| --------------- | ------ | ----------------------------- |
| `/api/tags`     | GET    | List available models         |
| `/api/generate` | POST   | Generate completion           |
| `/api/chat`     | POST   | Chat completion (alternative) |

### 10.2 Obsidian APIs Used

| API             | Usage                  |
| --------------- | ---------------------- |
| `Plugin`        | Base plugin class      |
| `WorkspaceLeaf` | Sidebar management     |
| `MarkdownView`  | Editor access          |
| `Setting`       | Settings UI            |
| `Notice`        | User notifications     |
| `requestUrl`    | HTTP requests (Ollama) |
| `debounce`      | Event throttling       |

---

_Document version: 0.1.0_  
_Last updated: December 2024_
