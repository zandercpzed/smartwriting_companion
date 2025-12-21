## Phase 1: Layout & Plugin Structure

### 1.1 Initialize Plugin

```
Create an Obsidian plugin project called "smartwrite-companion" with:
- TypeScript configuration
- esbuild for bundling
- manifest.json (id: smartwrite-companion, name: SmartWrite Companion, version: 0.1.0)
- Basic main.ts with plugin lifecycle (onload, onunload)
- Settings tab skeleton

Directory structure:
src/
├── main.ts
├── settings.ts
├── types.ts
├── ui/
├── core/
├── services/
└── i18n/
```

### 1.2 Sidebar View

```
Create a sidebar view for the SmartWrite plugin:
- Extends ItemView
- VIEW_TYPE: "smartwrite-sidebar"
- Icon: "pencil"
- Opens on right leaf by default
- Container with class "smartwrite-container"

Include method to toggle sidebar visibility via command palette.
```

### 1.3 Modular Accordion UI

```
Implement modular accordion components for the sidebar:

Modules (collapsible):
1. Session Stats
2. Text Metrics
3. Readability
4. Suggestions
5. Persona Analysis

Requirements:
- Each module: header (clickable) + content area
- Collapse/expand with arrow indicator
- State persistence (which modules are open)
- CSS using Obsidian variables (--background-secondary, --text-normal, etc.)
- Settings to show/hide each module
```

### 1.4 Styles

```
Create styles.css for SmartWrite sidebar:

Requirements:
- Inherit Obsidian theme (light/dark) via CSS variables
- Module spacing: 12px padding, 8px gap
- Subtle borders: var(--background-modifier-border)
- Typography:
  - Headers: 13px semibold
  - Body: 12px
  - Large numbers: 24px bold monospace
  - Labels: 11px muted
- Severity dots: 8px circles (green/yellow/red)
- Progress bar component
- Compact, minimal design
```

---

## Phase 2: Core Features

### 2.1 Text Analyzer

```
Create TextAnalyzer class in src/core/TextAnalyzer.ts:

Input: raw text string, language code
Output: TextMetrics object

Metrics to extract:
- words: string[]
- sentences: string[]
- paragraphs: string[]
- characters: number
- charactersNoSpaces: number
- syllables: number (using hyphen library with language pattern)

Dependencies: hyphen, sbd

Include word frequency map and repetition detection (threshold configurable).
```

### 2.2 Stats Engine

```
Create StatsEngine class in src/core/StatsEngine.ts:

Input: TextMetrics
Output: TextStats

Calculate:
- wordCount, charCount, charCountNoSpaces
- sentenceCount, paragraphCount
- avgWordsPerSentence, avgSyllablesPerWord
- uniqueWords count
- readingTimeMinutes (configurable WPM)

Wire to sidebar StatsPanel - update on editor change with 300ms debounce.
```

### 2.3 Session Tracker

```
Create SessionTracker in src/core/SessionTracker.ts:

Track per session:
- startTime
- wordsAtStart
- currentWords
- Calculate: sessionWords, sessionDuration, wordsPerMinute

Track daily:
- dailyWordCount (reset at midnight)
- dailyGoal progress percentage

Persist daily stats in plugin data.
```

### 2.4 Stats Panel UI

```
Update StatsPanel component to display:

Session Stats:
- Word count (large): "1,247 words"
- Goal progress bar: "1,247 / 2,000" with percentage
- Session time: "45 min"
- Writing pace: "28 wpm"

Text Metrics:
- Characters: X (no spaces: Y)
- Sentences: X
- Paragraphs: X
- Reading time: X min
- Unique words: X

Use monospace font for numbers. Update in real-time.
```

---

## Phase 3: Readability

### 3.1 Readability Engine

```
Create ReadabilityEngine in src/core/ReadabilityEngine.ts:

Implement formulas:
- Flesch Reading Ease
- Flesch-Kincaid Grade Level
- Gunning Fog Index
- SMOG Index
- Coleman-Liau Index
- ARI
- Dale-Chall (need word list)
- Linsear Write

For non-English:
- Flesch PT-BR (constant 248.835)
- Gulpease (character-based)

Input: TextMetrics + language
Output: ReadabilityScores object

Use text-readability for EN, custom implementation for others.
```

### 3.2 Readability Panel UI

```
Update ReadabilityPanel component:

Display:
- Primary score: large number + level label (e.g., "72 - Easy")
- Horizontal bar visualization (color-coded)
- Dropdown to select primary formula
- Expandable section with all scores

Color scale: red (hard) -> yellow (medium) -> green (easy)
```

---

## Phase 4: Suggestions

### 4.1 Suggestion Engine

```
Create SuggestionEngine in src/core/SuggestionEngine.ts:

Detect issues:
- REPEATED_WORD: same word 3+ times in proximity
- LONG_SENTENCE: exceeds threshold (default 30 words)
- DENSE_PARAGRAPH: exceeds threshold (default 6 sentences)
- PASSIVE_VOICE: pattern matching per language
- EXCESSIVE_ADVERB: -ly words density
- CLICHE: match against dictionary

Output: Suggestion[] with:
- type, severity (info/warning/error)
- message, text range (start/end)
- replacements (optional)

Load patterns from data/locales/{lang}/ JSON files.
```

### 4.2 Suggestions Panel UI

```
Update SuggestionsPanel component:

Display:
- Header with count badge: "7 issues"
- List of suggestions:
  - Severity dot (colored)
  - Issue type label
  - Brief description
  - Click to scroll to location in editor

Include filter by severity toggle.
```

### 4.3 Editor Highlighting

```
Implement editor decorations for suggestions:

- Use CodeMirror StateField for decorations
- Underline style matching severity color
- Hover tooltip with suggestion message
- Click to show replacement options

Sync with SuggestionEngine output on text change.
```

---

## Phase 5: LLM Integration

### 5.1 Ollama Service

```
Create OllamaService in src/services/OllamaService.ts:

Methods:
- checkHealth(): Promise<boolean>
- listModels(): Promise<string[]>
- generate(prompt, system?, options?): Promise<string>
- generateStream(prompt, system?): AsyncGenerator<string>

Config: endpoint (default localhost:11434), model, timeout

Handle errors gracefully. Show connection status in UI.
```

### 5.2 Persona Manager

```
Create PersonaManager in src/services/PersonaManager.ts:

Built-in personas:
- critical-editor
- common-reader
- technical-reviewer
- devils-advocate
- booktuber
- fandom
- avid-reader

Load prompts from src/personas/prompts/*.md files.

Methods:
- getPersona(id): PersonaConfig
- analyze(personaId, text, context): Promise<AnalysisResult>
- Custom persona support from settings
```

### 5.3 Persona Panel UI

```
Update PersonaPanel component:

Display:
- Connection status indicator (green dot / "Offline")
- Dropdown to select persona
- "Analyze" button (disabled if offline)
- Loading spinner during analysis
- Results area (collapsible, markdown rendered)
- Option to analyze selection vs full document
```

### 5.4 Cache Service

```
Create CacheService in src/services/CacheService.ts:

Cache LLM analysis results:
- Key: MD5 hash of (personaId + text content)
- Store: result + timestamp
- TTL: configurable (default 1 hour)
- Max entries: configurable

Methods:
- get(key): CacheEntry | null
- set(key, result): void
- invalidate(key?): void
```

---

## Phase 6: i18n & Polish

### 6.1 Internationalization

```
Implement i18n system in src/i18n/:

- Load locale JSON files from src/i18n/locales/
- Auto-detect from Obsidian locale or system
- Fallback to English
- t(key, params?) function for translations

Create locale files: en.json, pt.json, es.json, fr.json, de.json

Translate all UI strings.
```

### 6.2 Settings Tab

```
Complete SettingsTab implementation:

Sections:
- Language: dropdown
- Statistics: daily goal, reading speed
- Suggestions: thresholds (sentence length, paragraph size, repetition)
- Readability: primary formula selection
- Ollama: endpoint, model, timeout, test connection button
- Personas: enable/disable each, custom persona editor
- UI: sidebar position, compact mode, module visibility toggles
```

### 6.3 Commands

```
Register plugin commands:

- smartwrite:toggle-sidebar
- smartwrite:analyze-document
- smartwrite:analyze-selection
- smartwrite:reset-session
- smartwrite:reset-daily-stats

Add hotkey suggestions in settings.
```

---

## Phase 7: Testing

### 7.1 Unit Tests

```
Create tests using Vitest:

Test files:
- tests/core/TextAnalyzer.test.ts
- tests/core/StatsEngine.test.ts
- tests/core/ReadabilityEngine.test.ts
- tests/core/SuggestionEngine.test.ts
- tests/services/CacheService.test.ts

Test fixtures in tests/fixtures/ with sample texts in multiple languages.

Coverage target: 80%+
```

### 7.2 Integration Tests

```
Create integration tests:

- Full analysis pipeline (text -> metrics -> stats -> suggestions)
- Settings persistence
- Sidebar state persistence
- Ollama mock for persona tests
```

---

## Phase 8: Publication

### 8.1 Prepare Release

```
Prepare for Obsidian community plugin submission:

1. Update manifest.json with final metadata
2. Create README.md with:
   - Feature overview
   - Installation instructions
   - Ollama setup guide
   - Screenshots
3. Add LICENSE (MIT)
4. Create CHANGELOG.md
5. Build production bundle
6. Test in fresh Obsidian vault
```

### 8.2 Submit

```
Submit to Obsidian community plugins:

1. Fork obsidianmd/obsidian-releases
2. Add entry to community-plugins.json
3. Create PR with:
   - Plugin description
   - Link to repository
4. Address review feedback
```

---

_Document version: 0.1.0_
