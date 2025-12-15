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

// Re-export this type to avoid circular dependency issues if needed,
// though normally valid in TS as long as it's defined.
import { LLMProviderType } from './settings';

// ... (other interfaces)
