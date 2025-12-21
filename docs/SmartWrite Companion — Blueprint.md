## 1. Overview

**SmartWrite Companion** is an Obsidian plugin that works as an intelligent sidebar for writers. It combines real-time statistics, contextual suggestions, and LLM analysis using synthetic personas. **All processing runs locally—no remote services required.**

---

## 2. Core Features

### 2.1 Real-Time Statistics

| Metric                   | Description                              |
| ------------------------ | ---------------------------------------- |
| Word count               | Total, current session, daily goal       |
| Character count          | With and without spaces                  |
| Reading time             | Estimated in minutes                     |
| Paragraphs and sentences | Count and average words per sentence     |
| Readability              | Flesch-Kincaid Index (adapted for PT-BR) |
| Vocabulary               | Unique words, excessive repetitions      |
| Writing pace             | Words/minute in session                  |

#### Readability Analysis Methods

| Method                                | Origin          | Description                                   | Formula Basis                              |
| ------------------------------------- | --------------- | --------------------------------------------- | ------------------------------------------ |
| **Flesch Reading Ease**               | USA (1948)      | Scale 0-100, higher = easier                  | Based on words/sentence and syllables/word |
| **Flesch-Kincaid Grade**              | USA (1975)      | Returns US grade level                        | Derived from Flesch, used by US government |
| **Gunning Fog Index**                 | USA (1952)      | Years of education needed                     | Focus on "complex words" (3+ syllables)    |
| **SMOG Index**                        | USA (1969)      | Similar to Fog, more accurate for short texts | Counts polysyllables in 30-sentence sample |
| **Coleman-Liau Index**                | USA (1975)      | Uses characters instead of syllables          | Letters/100 words and sentences/100 words  |
| **Automated Readability Index (ARI)** | USA (1967)      | Grade level, easy to compute                  | Characters/word and words/sentence         |
| **Dale-Chall**                        | USA (1948/1995) | Compares with "easy words" list               | 3,000 words known by 4th graders           |
| **Linsear Write**                     | USA             | Developed for technical documents             | Easy words (≤2 syllables) vs hard          |
| **Flesch adapted PT-BR**              | Brazil          | Martins et al. (1996) adaptation              | Adjusted constants for Portuguese          |
| **Gulpease Index**                    | Italy           | For Romance languages, applicable to PT       | Character-based, more accurate for PT      |

**Recommendation:** Implement Flesch adapted PT-BR as primary, Gulpease as alternative. For English texts, use Flesch-Kincaid Grade.

### 2.2 Action Suggestions

- **Repeated words**: Highlight and suggest synonyms
- **Long sentences**: Alert when exceeding configurable threshold
- **Dense paragraphs**: Suggest breaks
- **Passive voice**: Identify and suggest reformulation
- **Excessive adjectives/adverbs**: "Textual economy" metrics
- **Clichés and redundancies**: Database of expressions to avoid

### 2.3 Synthetic Persona Analysis (Local LLM)

Pre-defined personas that analyze text from different perspectives:

| Persona                | Function                                                                  |
| ---------------------- | ------------------------------------------------------------------------- |
| **Critical Editor**    | Points out structural flaws, inconsistencies, weak points                 |
| **Common Reader**      | Evaluates clarity and engagement for general audience                     |
| **Technical Reviewer** | Focus on grammar, style, and editorial conventions                        |
| **Devil's Advocate**   | Questions arguments and seeks counterpoints                               |
| **Booktuber**          | Evaluates "sellability", hook, viral potential, cover-worthiness          |
| **Fandom**             | Analyzes from fan perspective: ships, headcanons, fanfic/fanart potential |
| **Avid Reader**        | Voracious reader who compares with genre references, detects clichés      |
| **Custom Persona**     | User defines characteristics and focus                                    |

**Analysis modes:**

- Full document analysis
- Selection analysis (specific excerpt)
- Continuous analysis (every X paragraphs written)

---

## 3. Development Phases

### Phase 1 - MVP (4-6 weeks)

- [ ] Basic plugin structure
- [ ] Sidebar with real-time statistics
- [ ] Word, character, paragraph count
- [ ] Estimated reading time
- [ ] Basic settings

### Phase 2 - Suggestions (3-4 weeks)

- [ ] Problem detection engine
- [ ] Repeated words
- [ ] Long sentences
- [ ] Suggestions panel in sidebar
- [ ] Editor highlighting

### Phase 3 - Local LLM Integration (4-5 weeks)

- [ ] Ollama service implementation
- [ ] Connection health check
- [ ] Basic persona system
- [ ] Analysis panel

### Phase 4 - Advanced Personas (3-4 weeks)

- [ ] Customizable personas
- [ ] Continuous analysis (background)
- [ ] Analysis history
- [ ] Multiple model support

### Phase 5 - Polish (2-3 weeks)

- [ ] Internationalization (multilingual support)
- [ ] Themes and visual customization
- [ ] Performance optimization
- [ ] Documentation

---

## 4. Open Questions

> Pending decisions for discussion:

1. **Monetization**: Free plugin? Freemium? What model?
2. **Additional personas**: What other personas would be useful?
    - SEO Specialist?
    - Genre-specific Beta Reader?
    - Translator/Localizer?

3. **Integrations**:
    - Sync with goals in external apps?
    - Export reports?

4. **Gamification**:
    - Writing streaks?
    - Achievements?
    - Visual progress bars?

5. **Collaboration**:
    - Share analyses?
    - Shared personas between users?

---

## 5. Next Steps

1. Validate proposed architecture
2. Define feature priorities
3. Set up development environment
4. Create initial project structure
5. Implement MVP

---

_Document created: December 2024_  
_Version: 0.1.0-draft_

---

## Appendix A: Readability Formulas

### A.1 Flesch Reading Ease (FRE)

**Original formula (English):**

```
FRE = 206.835 - (1.015 × ASL) - (84.6 × ASW)
```

**Where:**

- ASL = Average Sentence Length (total words ÷ total sentences)
- ASW = Average Syllables per Word (total syllables ÷ total words)

**Scale interpretation:**

| Score  | Level            | Equivalence   |
| ------ | ---------------- | ------------- |
| 90-100 | Very easy        | 5th grade     |
| 80-89  | Easy             | 6th grade     |
| 70-79  | Fairly easy      | 7th grade     |
| 60-69  | Standard         | 8th-9th grade |
| 50-59  | Fairly difficult | High school   |
| 30-49  | Difficult        | College       |
| 0-29   | Very difficult   | Graduate      |

---

### A.2 Flesch-Kincaid Grade Level (FKGL)

**Formula:**

```
FKGL = (0.39 × ASL) + (11.8 × ASW) - 15.59
```

**Result:** Number corresponds to US grade level (e.g., 8.0 = 8th grade)

---

### A.3 Gunning Fog Index

**Formula:**

```
Fog = 0.4 × (ASL + PHW)
```

**Where:**

- ASL = Average Sentence Length
- PHW = Percentage of Hard Words (words with 3+ syllables, excluding proper nouns, compound verbs, and common suffixes)

**Result:** Years of formal education needed

| Score | Level          |
| ----- | -------------- |
| ≤6    | Easy reading   |
| 7-8   | Conversational |
| 9-12  | High school    |
| 13-16 | College        |
| ≥17   | Graduate       |

---

### A.4 SMOG Index

**Formula:**

```
SMOG = 1.0430 × √(polysyllables × (30 ÷ sentences)) + 3.1291
```

**Simplified (30 sentences):**

```
SMOG = √(polysyllables) + 3
```

---

### A.5 Coleman-Liau Index

**Formula:**

```
CLI = (0.0588 × L) - (0.296 × S) - 15.8
```

**Where:**

- L = Average letters per 100 words
- S = Average sentences per 100 words

---

### A.6 Automated Readability Index (ARI)

**Formula:**

```
ARI = (4.71 × (characters ÷ words)) + (0.5 × (words ÷ sentences)) - 21.43
```

---

### A.7 Dale-Chall Readability Score

**Formula:**

```
Raw Score = 0.1579 × PDW + 0.0496 × ASL

If PDW > 5%:
    Adjusted Score = Raw Score + 3.6365
```

**Where:**

- PDW = Percentage of Difficult Words (not in Dale-Chall list of ~3,000 words)

---

### A.8 Linsear Write Formula

1. Count words in 100-word sample:
    - Easy words (≤2 syllables) = count × 1
    - Hard words (≥3 syllables) = count × 3
2. Divide sum by number of sentences
3. Adjust: if result > 20, divide by 2; else (result - 2) ÷ 2

---

### A.9 Flesch Index Adapted for Portuguese (Martins et al., 1996)

**Formula:**

```
IFLP = 248.835 - (1.015 × ASL) - (84.6 × ASW)
```

**Note:** Constant 248.835 compensates for Portuguese's higher syllable average.

| Score  | Level          |
| ------ | -------------- |
| 75-100 | Very easy      |
| 50-75  | Easy           |
| 25-50  | Difficult      |
| 0-25   | Very difficult |

---

### A.10 Gulpease Index

**Formula:**

```
Gulpease = 89 + ((300 × sentences) - (10 × letters)) ÷ words
```

| Score  | Elementary | High School | College   |
| ------ | ---------- | ----------- | --------- |
| <80    | Difficult  | Difficult   | Difficult |
| 80-89  | Easy       | Difficult   | Difficult |
| 90-100 | Easy       | Easy        | Easy      |

**Advantage:** Does not depend on syllable counting.
