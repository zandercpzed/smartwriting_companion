## Figma Make Prompt

```
Design a minimalist sidebar plugin UI for Obsidian called "SmartWrite Companion".

LAYOUT:
- Right sidebar panel, 320px width
- Theme: inherit from Obsidian (support both light and dark modes using CSS variables)
- Modular accordion structure - each section collapsible

MODULES (top to bottom):

1. SESSION STATS
   - Word count: "1,247 words" (large)
   - Today's goal progress bar: "1,247 / 2,000"
   - Session time: "45 min"
   - Writing pace: "28 wpm"

2. TEXT METRICS
   - Characters: 6,842 (no spaces: 5,691)
   - Sentences: 89
   - Paragraphs: 12
   - Reading time: 5 min
   - Unique words: 412

3. READABILITY
   - Primary score: large number with label (e.g., "72 - Easy")
   - Small horizontal bar visualization
   - Dropdown to switch formula
   - Secondary scores in compact list

4. SUGGESTIONS
   - Count badge: "7 issues"
   - List items with severity indicator (subtle colored dot)
   - Each item: issue type + brief description
   - Clickable to locate in text

5. PERSONA ANALYSIS
   - Dropdown to select persona
   - "Analyze" button
   - Results area (collapsible response)
   - Status: "Ollama connected" / "Offline"

STYLE RULES:
- No emojis
- Minimal icons (only essential: collapse arrows, settings gear)
- Typography hierarchy via weight/size, not color
- Subtle borders between modules (#2a2a2a)
- Compact spacing, 12px padding
- Monospace for numbers
- Module headers: clickable to collapse, small arrow indicator

STATES:
- Collapsed module: header only + arrow
- Expanded module: full content
- Ollama offline: muted analysis section with "Connect" link

Include a small gear icon in top-right corner for settings.

LOCALIZATION:
- All UI text must support i18n
- Auto-detect system language or follow Obsidian locale
- Module headers, labels, and messages from translation files
```

---

## Design Specifications

### Colors

Uses Obsidian CSS variables to inherit theme automatically:

| Element        | CSS Variable                   |
| -------------- | ------------------------------ |
| Background     | `--background-secondary`       |
| Module border  | `--background-modifier-border` |
| Primary text   | `--text-normal`                |
| Secondary text | `--text-muted`                 |
| Accent         | `--interactive-accent`         |
| Success        | `--color-green`                |
| Warning        | `--color-yellow`               |
| Error          | `--color-red`                  |

**Fallback values (if needed):**

| Element        | Light   | Dark    |
| -------------- | ------- | ------- |
| Background     | #f5f5f5 | #1e1e1e |
| Module border  | #e0e0e0 | #2a2a2a |
| Primary text   | #1e1e1e | #e0e0e0 |
| Secondary text | #666666 | #888888 |
| Accent         | #7c3aed | #7c3aed |

### Typography

| Element             | Size | Weight |
| ------------------- | ---- | ------ |
| Module header       | 13px | 600    |
| Body text           | 12px | 400    |
| Large numbers       | 24px | 700    |
| Small labels        | 11px | 400    |
| Monospace (numbers) | 12px | 500    |

### Spacing

| Element        | Value |
| -------------- | ----- |
| Module padding | 12px  |
| Module gap     | 8px   |
| Item spacing   | 6px   |
| Border radius  | 4px   |

---

## Module Visibility Settings

Users can toggle visibility for each module:

- [ ] Session Stats
- [ ] Text Metrics
- [ ] Readability
- [ ] Suggestions
- [ ] Persona Analysis

Default: all modules visible, all expanded.

---

_Document version: 0.1.0_
