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
