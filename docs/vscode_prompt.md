# Smart Writing Companion - Development Prompt

> Use este prompt no VS Code com Copilot, Cursor, Cline, ou outra ferramenta de AI para gerar código.

---

## 🎯 Project Context

You are developing **Smart Writing Companion**, an Obsidian plugin that serves as an editorial assistant for fiction writers. The plugin provides local text analysis, cleanup tools, and optional LLM-powered feedback through simulated reader personas.

### Core Value Proposition

- **Local-first**: All basic analysis runs without internet
- **Fiction-focused**: Metrics designed for creative writing (dialogue ratio, pacing, show vs tell)
- **LLM-enhanced**: Optional AI evaluation via Ollama (local) or cloud providers (Gemini, OpenAI, Anthropic)

---

## 🛠️ Technology Stack

```yaml
Language: TypeScript (strict mode)
Target: ES6, ESNext modules
Platform: Obsidian Plugin API (1.5.0+)
Build: esbuild
License: GPL-3.0

Dependencies:
  runtime: []  # Zero runtime dependencies for core features
  dev:
    - typescript: ^5.3.0
    - esbuild: ^0.19.0
    - obsidian: latest
    - @types/node: ^20.10.0

Optional (for extended features):
  - text-readability: ^1.0.5  # If needed for validation
  - compromise: ^14.10.0     # If NLP features expand
```

---

## 📁 Project Structure

```
text_companion/
├── .github/                    # GitHub workflows, templates
├── docs/                       # Documentation
├── files/                      # Reference files, exports
├── prompts/
│   └── personas/
│       ├── booktuber.md        # ✅ EXISTS - Influencer persona prompt
│       ├── casual.md           # ✅ EXISTS - Casual reader persona prompt
│       └── hardcore.md         # ✅ EXISTS - Hardcore SF/Fantasy reader prompt
├── src/
│   ├── main.ts                 # 🔨 IMPLEMENT - Plugin entry point
│   ├── types/
│   │   ├── index.ts            # 🔨 IMPLEMENT - Export all types
│   │   ├── settings.ts         # 🔨 IMPLEMENT - SWCSettings interface
│   │   └── analysis.ts         # 🔨 IMPLEMENT - Analysis result types
│   ├── settings/
│   │   └── SettingsTab.ts      # 🔨 IMPLEMENT - Settings UI
│   ├── views/
│   │   ├── CompanionView.ts    # 🔨 IMPLEMENT - Main sidebar view
│   │   ├── components/         # 🔨 CREATE - Reusable UI components
│   │   └── blobs/              # 🔨 CREATE - Activity feed items
│   ├── analyzers/
│   │   ├── index.ts            # 🔨 IMPLEMENT - Export all analyzers
│   │   ├── StatisticsAnalyzer.ts    # 🔨 IMPLEMENT
│   │   ├── ReadabilityAnalyzer.ts   # 🔨 IMPLEMENT
│   │   ├── StyleAnalyzer.ts         # 🔨 IMPLEMENT
│   │   ├── FictionAnalyzer.ts       # 🔨 IMPLEMENT
│   │   └── TextCleanup.ts           # 🔨 IMPLEMENT
│   ├── services/
│   │   ├── index.ts            # 🔨 IMPLEMENT - Export all services
│   │   ├── AnalysisService.ts  # 🔨 IMPLEMENT - Orchestrates analyzers
│   │   ├── CleanupService.ts   # 🔨 IMPLEMENT - Text normalization
│   │   └── PersonaService.ts   # 🔨 IMPLEMENT - LLM persona evaluation
│   ├── gateway/
│   │   ├── index.ts            # 🔨 IMPLEMENT
│   │   └── LLMGateway.ts       # 🔨 IMPLEMENT - Ollama/Cloud abstraction
│   ├── editor/                 # 🔨 CREATE - Editor extensions
│   └── commands/               # 🔨 CREATE - Command definitions
├── styles/
│   ├── tokens.css              # 🔨 IMPLEMENT - Design tokens
│   └── main.css                # 🔨 IMPLEMENT - Component styles
├── manifest.json               # ✅ EXISTS
├── package.json                # ✅ EXISTS
├── tsconfig.json               # ✅ EXISTS
├── esbuild.config.mjs          # ✅ EXISTS
├── README.md                   # ✅ EXISTS
├── CONTRIBUTING.md             # ✅ EXISTS
└── AGENT.md                    # ✅ EXISTS
```

---

## 📐 Architecture Rules

### 1. Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      UI LAYER                                │
│  CompanionView, SettingsTab, Blobs, Editor Decorations      │
├─────────────────────────────────────────────────────────────┤
│                   SERVICE LAYER                              │
│  AnalysisService, CleanupService, PersonaService            │
├─────────────────────────────────────────────────────────────┤
│                  ANALYZER LAYER                              │
│  Statistics, Readability, Style, Fiction, TextCleanup       │
├─────────────────────────────────────────────────────────────┤
│                   GATEWAY LAYER                              │
│  LLMGateway → Ollama | Gemini | OpenAI | Anthropic          │
└─────────────────────────────────────────────────────────────┘
```

### 2. Dependency Rules

- **Analyzers**: ZERO dependencies, pure TypeScript, 100% local
- **Services**: May use Analyzers, may use Gateway
- **Views**: May use Services, never use Analyzers directly
- **Gateway**: Isolated, uses only Obsidian's `requestUrl`

### 3. Code Style

```typescript
// ✅ DO: Export interfaces from types/
export interface DocumentStats {
  words: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
}

// ✅ DO: Use dependency injection
class AnalysisService {
  constructor(
    private statsAnalyzer: StatisticsAnalyzer,
    private readabilityAnalyzer: ReadabilityAnalyzer
  ) {}
}

// ✅ DO: Return typed results
analyze(text: string): FullAnalysis { ... }

// ❌ DON'T: Use external dependencies in analyzers
import nlp from 'compromise'; // NO!

// ❌ DON'T: Access Obsidian API in analyzers
this.app.vault.read(...); // NO! (only in main.ts/views)
```

---

## 📝 Type Definitions

### src/types/settings.ts

```typescript
export type LLMProviderType = 'ollama' | 'gemini' | 'openai' | 'anthropic'

export interface SWCSettings {
    llm: {
        preferLocal: boolean
        ollamaBaseUrl: string
        ollamaModel: string
        geminiApiKey: string
        openaiApiKey: string
        anthropicApiKey: string
        defaultCloudProvider: LLMProviderType
        timeout: number
    }
    analysis: {
        maxSentenceLength: number
        maxPassiveVoicePercent: number
        maxAdverbsPer1000: number
        fleschKincaidMin: number
        fleschKincaidMax: number
        filterWords: string[]
    }
    cleanup: {
        normalizeQuotes: boolean
        normalizeDashes: boolean
        normalizeEllipsis: boolean
        normalizeWhitespace: boolean
        removeControlChars: boolean
        preserveMarkdown: boolean
    }
    translation: {
        targetLanguage: 'pt' | 'en'
        autoDetectProperNouns: boolean
        preserveTerms: string[]
    }
    ui: {
        showOnStartup: boolean
        autoAnalyze: boolean
        showInlineSuggestions: boolean
        compactMode: boolean
    }
}

export const DEFAULT_SETTINGS: SWCSettings = {
    llm: {
        preferLocal: true,
        ollamaBaseUrl: 'http://localhost:11434',
        ollamaModel: 'qwen2.5:7b',
        geminiApiKey: '',
        openaiApiKey: '',
        anthropicApiKey: '',
        defaultCloudProvider: 'gemini',
        timeout: 30000,
    },
    analysis: {
        maxSentenceLength: 40,
        maxPassiveVoicePercent: 5,
        maxAdverbsPer1000: 20,
        fleschKincaidMin: 7,
        fleschKincaidMax: 9,
        filterWords: ['viu', 'sentiu', 'percebeu', 'saw', 'felt', 'noticed'],
    },
    cleanup: {
        normalizeQuotes: true,
        normalizeDashes: true,
        normalizeEllipsis: true,
        normalizeWhitespace: true,
        removeControlChars: true,
        preserveMarkdown: true,
    },
    translation: {
        targetLanguage: 'pt',
        autoDetectProperNouns: true,
        preserveTerms: [],
    },
    ui: {
        showOnStartup: true,
        autoAnalyze: true,
        showInlineSuggestions: true,
        compactMode: false,
    },
}
```

### src/types/analysis.ts

```typescript
export interface DocumentStats {
    words: number
    characters: number
    charactersNoSpaces: number
    sentences: number
    paragraphs: number
    readingTimeMinutes: number
}

export interface ReadabilityMetrics {
    fleschKincaid: number // Grade level (target: 7-9)
    fleschReadingEase: number // 0-100 (higher = easier)
    gunningFog: number // Years of education
    smog: number // SMOG index
    colemanLiau: number // Coleman-Liau index
    automatedReadability: number // ARI
    daleChall: number // Dale-Chall score
}

export interface StyleMetrics {
    passiveVoiceCount: number
    passiveVoicePercent: number
    adverbCount: number
    adverbsPer1000: number
    filterWordCount: number
    longSentenceCount: number
    averageSentenceLength: number
    issues: StyleIssue[]
}

export interface StyleIssue {
    type:
        | 'passive-voice'
        | 'adverb'
        | 'filter-word'
        | 'long-sentence'
        | 'repetition'
    text: string
    position: TextPosition
    severity: 'info' | 'warning' | 'error'
    suggestion?: string
}

export interface TextPosition {
    start: number
    end: number
}

export interface FictionMetrics {
    dialogueRatio: number // Percentage of dialogue
    dialogueWords: number
    narrativeWords: number
    sceneCount: number
    averageSceneLength: number
}

export interface FullAnalysis {
    stats: DocumentStats
    readability: ReadabilityMetrics
    style: StyleMetrics
    fiction: FictionMetrics
    analyzedAt: Date
    documentHash: string
}

export interface AnalysisProgress {
    stage: 'stats' | 'readability' | 'style' | 'fiction' | 'complete'
    percent: number
    message: string
}

export interface CleanupSuggestion {
    id: string
    type: 'quote' | 'dash' | 'ellipsis' | 'whitespace' | 'control-char'
    original: string
    replacement: string
    position: TextPosition
    description: string
}

export interface CleanupResult {
    suggestions: CleanupSuggestion[]
    stats: {
        quotes: number
        dashes: number
        ellipsis: number
        whitespace: number
        controlChars: number
        total: number
    }
}

export type PersonaId = 'booktuber' | 'hardcore' | 'casual' | string

export interface PersonaEvaluation {
    personaId: PersonaId
    personaName: string
    rating: number // 1-5 stars
    summary: string
    strengths: string[]
    weaknesses: string[]
    fullEvaluation: string
    evaluatedAt: Date
}

export interface LLMStatus {
    provider: LLMProviderType | null
    isConnected: boolean
    isLocal: boolean
    modelName: string | null
    lastChecked: Date
    error?: string
}

export interface CompletionOptions {
    systemPrompt?: string
    maxTokens?: number
    temperature?: number
}
```

---

## 🔧 Implementation Specifications

### StatisticsAnalyzer

```typescript
/**
 * Calculates basic document statistics (100% local, zero dependencies)
 * 
 * Requirements:
 * - Count words accurately (handle contractions, hyphenated words)
 * - Count sentences (handle abbreviations like "Dr.", "etc.")
 * - Count paragraphs (double newline separated)
 * - Calculate reading time at 200 WPM (fiction reading speed)
 * - Strip markdown before counting
 * - Support Portuguese and English text
 */
export class StatisticsAnalyzer {
    analyze(text: string): DocumentStats
    private countWords(text: string): number
    private countSentences(text: string): number
    private countParagraphs(text: string): number
    private calculateReadingTime(words: number): number
    private stripMarkdown(text: string): string
}
```

### ReadabilityAnalyzer

```typescript
/**
 * Calculates readability metrics (100% local, zero dependencies)
 * 
 * Requirements:
 * - Implement all 7 readability formulas from scratch
 * - Count syllables for Portuguese and English
 * - Handle edge cases (empty text, single sentence)
 * - Return values within expected ranges
 * 
 * Formulas:
 * - Flesch-Kincaid: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
 * - Flesch Reading Ease: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
 * - Gunning Fog: 0.4 * ((words/sentences) + 100 * (complexWords/words))
 * - SMOG: 1.0430 * sqrt(polysyllables * (30/sentences)) + 3.1291
 * - Coleman-Liau: 0.0588 * L - 0.296 * S - 15.8 (L=letters/100words, S=sentences/100words)
 * - ARI: 4.71 * (chars/words) + 0.5 * (words/sentences) - 21.43
 * - Dale-Chall: 0.1579 * difficultPercent + 0.0496 * avgSentenceLength (+ 3.6365 if >5%)
 */
export class ReadabilityAnalyzer {
    analyze(text: string): ReadabilityMetrics
    private countSyllables(word: string): number // Support PT and EN
    private isComplexWord(word: string): boolean // 3+ syllables
}
```

### StyleAnalyzer

```typescript
/**
 * Detects style issues (100% local, zero dependencies)
 * 
 * Requirements:
 * - Detect passive voice (PT: foi/foram/era + particípio, EN: was/were/been + participle)
 * - Find adverbs (PT: -mente, EN: -ly, excluding exceptions)
 * - Identify filter words (configurable list)
 * - Flag long sentences (configurable threshold)
 * - Detect word repetitions within proximity window
 * 
 * Patterns:
 * - Passive PT: \b(foi|foram|é|são|era|eram|será|serão|sido|sendo)\s+\w+(ado|ido|to)\b
 * - Passive EN: \b(was|were|is|are|been|being)\s+\w+(ed|en|own|ung)\b
 * - Adverb PT: \b\w+mente\b
 * - Adverb EN: \b\w+ly\b (exclude: only, early, daily, friendly, likely, ugly, holy, family)
 */
export class StyleAnalyzer {
    analyze(text: string): StyleMetrics
    findPassiveVoice(text: string): StyleIssue[]
    findAdverbs(text: string): StyleIssue[]
    findFilterWords(text: string): StyleIssue[]
    findLongSentences(text: string): StyleIssue[]
    findRepetitions(text: string, proximityWindow?: number): StyleIssue[]
}
```

### FictionAnalyzer

```typescript
/**
 * Fiction-specific metrics (100% local, zero dependencies)
 * 
 * Requirements:
 * - Calculate dialogue vs narrative ratio
 * - Detect scenes (separated by ***, ---, blank lines)
 * - Analyze pacing through sentence/paragraph variance
 * - Identify "telling" phrases (was happy, felt sad, etc.)
 * 
 * Dialogue markers:
 * - "quoted text"
 * - "smart quoted text"
 * - —em dash dialogue (Portuguese style)
 * - «guillemets» (European style)
 */
export class FictionAnalyzer {
    analyze(text: string): FictionMetrics
    extractDialogueLines(text: string): DialogueLine[]
    detectScenes(text: string): Scene[]
    analyzePacing(text: string): PacingAnalysis
    findTellingPhrases(text: string): TellingPhrase[]
}
```

### TextCleanup

```typescript
/**
 * Text normalization (100% local, zero dependencies)
 * 
 * Requirements:
 * - Normalize quotes: " → "", ' → '' (smart quotes)
 * - Normalize dashes: -- → —, spaced-hyphen → em-dash
 * - Normalize ellipsis: ... → …
 * - Clean whitespace: multiple spaces, trailing, before punctuation
 * - Remove control characters: zero-width, BOM, NBSP
 * - Preserve markdown code blocks
 * 
 * Modes:
 * - analyze(): Return suggestions without modifying
 * - clean(): Apply all normalizations
 * - applySuggestions(): Apply specific suggestions
 */
export class TextCleanup {
    analyze(text: string): CleanupResult
    clean(text: string): string
    applySuggestions(text: string, suggestions: CleanupSuggestion[]): string
}
```

### LLMGateway

```typescript
/**
 * Abstracts LLM providers with automatic fallback
 * 
 * Priority: Ollama (local) → Gemini → OpenAI → Anthropic
 * 
 * Requirements:
 * - Use Obsidian's requestUrl (not fetch) for CORS compatibility
 * - Cache responses for 5 minutes
 * - Automatic provider fallback on failure
 * - Timeout handling
 * 
 * Endpoints:
 * - Ollama: POST {baseUrl}/api/generate
 * - Gemini: POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 * - OpenAI: POST https://api.openai.com/v1/chat/completions
 * - Anthropic: POST https://api.anthropic.com/v1/messages
 */
export class LLMGateway {
    constructor(settings: LLMGatewaySettings)
    checkConnection(): Promise<LLMStatus>
    complete(prompt: string, options?: CompletionOptions): Promise<string>
    getStatus(): LLMStatus
    updateSettings(settings: Partial<LLMGatewaySettings>): void
}
```

---

## 🎨 UI Specifications

### CompanionView (Sidebar)

```
┌─────────────────────────────────────┐
│ ✏️ Smart Writing    🟢  ⚙️          │  Header: title, status dot, settings
├─────────────────────────────────────┤
│ 📄 chapter-01.md                    │  Document card
│    12,450 words • 62 min read       │
├─────────────────────────────────────┤
│ ▼ Readability                       │  Collapsible section
│   Flesch-Kincaid: 8.2  ████████░░   │  Progress bar
│   ● Passive: 3.2%                   │  Indicators with dots
│   ● Adverbs: 18/1000                │
│   ● Long sentences: 5               │
│   View all alerts →                 │
├─────────────────────────────────────┤
│  🧹 Clean   🔍 Analyze              │  Action grid (2x2)
│  🌐 Translate  📊 Report            │
│           Selection: 342 words      │
├─────────────────────────────────────┤
│ ▼ Reader Personas                   │  Collapsible
│  ┌─────────────────────────────┐    │
│  │ 📱 Booktuber                │    │  Persona card
│  │ Would this hook your feed?  │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 📚 Hardcore Reader          │    │
│  │ Does the worldbuilding hold?│    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 📖 Casual Reader            │    │
│  │ Is this an easy read?       │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│ ▼ Activity                          │  Activity feed
│  ┌─────────────────────────────┐    │
│  │ 💡 12 suggestions available │    │  Suggestion blob
│  │    [Accept] [Reject]        │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ ⭐⭐⭐⭐☆ Booktuber          │    │  Evaluation blob
│  │ "Great hook! Would share"   │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Status Dot Colors

```css
--swc-status-local: #22c55e; /* Green - Ollama connected */
--swc-status-cloud: #eab308; /* Yellow - Cloud provider */
--swc-status-offline: #ef4444; /* Red - No LLM available */
--swc-status-checking: #3b82f6; /* Blue - Checking connection */
```

### CSS Class Naming

```css
/* BEM-style naming */
.swc-companion {
}
.swc-companion__header {
}
.swc-companion__status-dot {
}
.swc-companion__status-dot--local {
}
.swc-companion__status-dot--cloud {
}
.swc-companion__status-dot--offline {
}

.swc-metrics {
}
.swc-metrics__meter {
}
.swc-metrics__indicator {
}

.swc-persona {
}
.swc-persona--disabled {
}

.swc-blob {
}
.swc-blob--suggestion {
}
.swc-blob--evaluation {
}
.swc-blob--error {
}
```

---

## 📋 Commands to Implement

| Command ID             | Name                        | Shortcut      | Requires LLM |
| ---------------------- | --------------------------- | ------------- | ------------ |
| `open-companion`       | Open companion panel        | `Cmd+Shift+W` | No           |
| `toggle-companion`     | Toggle companion panel      | -             | No           |
| `clean-document`       | Clean document              | -             | No           |
| `clean-selection`      | Clean selection             | `Cmd+Shift+C` | No           |
| `analyze-document`     | Analyze document            | -             | No           |
| `analyze-selection`    | Analyze selection           | -             | No           |
| `translate-to-pt`      | Translate to Portuguese     | -             | Yes          |
| `translate-to-en`      | Translate to English        | -             | Yes          |
| `evaluate-booktuber`   | Evaluate as Booktuber       | -             | Yes          |
| `evaluate-hardcore`    | Evaluate as Hardcore Reader | -             | Yes          |
| `evaluate-casual`      | Evaluate as Casual Reader   | -             | Yes          |
| `check-llm-connection` | Check LLM connection        | -             | No           |

---

## ✅ Implementation Checklist

### Phase 1: Core Infrastructure

- [ ] `src/types/settings.ts` - Settings interface and defaults
- [ ] `src/types/analysis.ts` - Analysis result types
- [ ] `src/types/index.ts` - Export all types
- [ ] `src/main.ts` - Plugin entry point with lifecycle
- [ ] `src/settings/SettingsTab.ts` - Settings UI

### Phase 2: Analyzers (100% Local)

- [ ] `src/analyzers/StatisticsAnalyzer.ts`
- [ ] `src/analyzers/ReadabilityAnalyzer.ts`
- [ ] `src/analyzers/StyleAnalyzer.ts`
- [ ] `src/analyzers/FictionAnalyzer.ts`
- [ ] `src/analyzers/TextCleanup.ts`
- [ ] `src/analyzers/index.ts`

### Phase 3: Services

- [ ] `src/services/AnalysisService.ts`
- [ ] `src/services/CleanupService.ts`
- [ ] `src/services/PersonaService.ts`
- [ ] `src/services/index.ts`

### Phase 4: LLM Gateway

- [ ] `src/gateway/LLMGateway.ts`
- [ ] `src/gateway/index.ts`

### Phase 5: UI

- [ ] `src/views/CompanionView.ts`
- [ ] `styles/tokens.css`
- [ ] `styles/main.css`

### Phase 6: Polish

- [ ] `src/editor/SuggestionDecorations.ts` - Inline highlights
- [ ] `src/commands/index.ts` - Command definitions
- [ ] Unit tests for analyzers

---

## 🚀 Quick Start Command

After implementing, build with:

```bash
npm install
npm run build
```

Copy to Obsidian:

```bash
cp main.js manifest.json styles.css /path/to/vault/.obsidian/plugins/text-companion/
```

---

## ⚠️ Critical Rules

1. **NO external dependencies in analyzers** - All analysis must work offline
2. **Use `requestUrl` not `fetch`** - Obsidian's API handles CORS
3. **Type everything** - No `any`, no implicit types
4. **Graceful degradation** - Plugin works without LLM (just fewer features)
5. **Portuguese + English** - All patterns must support both languages
6. **Cache analysis results** - Don't re-analyze unchanged documents
7. **Settings persistence** - Use `loadData`/`saveData` from Obsidian

---

## 📚 Reference Files

The following files are available in the repository for reference:

- `files/smart-writing-companion-architecture.md` - Full technical architecture
- `files/smart-writing-companion-one-page.md` - Product specification
- `prompts/personas/*.md` - Persona system prompts
- `AGENT.md` - AI development guidelines

---

_Use this prompt as context when asking AI tools to generate code for this project._
