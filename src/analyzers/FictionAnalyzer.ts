import { FictionMetrics } from '../types';

/**
 * Fiction-specific metrics (100% local, zero dependencies)
 */
export class FictionAnalyzer {
    analyze(text: string): FictionMetrics {
        const dialogStats = this.analyzeDialogue(text);
        const scenes = this.detectScenes(text);
        
        const averageSceneLength = scenes.length > 0 
            ? scenes.reduce((sum, s) => sum + s.wordCount, 0) / scenes.length 
            : text.length > 0 ? (text.match(/[\p{L}\p{N}'’-]+/gu) || []).length : 0;

        return {
            dialogueRatio: dialogStats.ratio,
            dialogueWords: dialogStats.dialogueWords,
            narrativeWords: dialogStats.narrativeWords,
            sceneCount: scenes.length,
            averageSceneLength
        };
    }

    private analyzeDialogue(text: string): { ratio: number, dialogueWords: number, narrativeWords: number } {
        // Dialogue markers: "", “”, — (em dash used in PT), «»
        // We want to capture text inside quotes or after em-dashes
        
        let dialogueWords = 0;
        let narrativeWords = 0;
        
        // Simple state machine or regex approach
        // Regex is tricky for nested or multi-line, but often sufficient for estimates
        
        // 1. Quoted text
        const quoteMatches = text.matchAll(/["“«]([^"”»]+)["”»]/g);
        let cleanedTextForNarrative = text;

        for (const match of quoteMatches) {
             const words = (match[1].match(/[\p{L}\p{N}'’-]+/gu) || []).length;
             dialogueWords += words;
             // Remove from text to count narrative later (rough approximation)
             cleanedTextForNarrative = cleanedTextForNarrative.replace(match[0], ' ');
        }

        // 2. Em-dash dialogue (Portuguese style mostly)
        // Line starts with —, or newline + —
        const dashMatches = text.matchAll(/(^|\n)\s*—([^\n]+)/g);
        for (const match of dashMatches) {
             const words = (match[2].match(/[\p{L}\p{N}'’-]+/gu) || []).length;
             dialogueWords += words;
             cleanedTextForNarrative = cleanedTextForNarrative.replace(match[0], ' ');
        }

        narrativeWords = (cleanedTextForNarrative.match(/[\p{L}\p{N}'’-]+/gu) || []).length;
        
        const total = dialogueWords + narrativeWords;
        const ratio = total > 0 ? (dialogueWords / total) * 100 : 0;

        return { ratio, dialogueWords, narrativeWords };
    }

    private detectScenes(text: string): { start: number, end: number, wordCount: number }[] {
        // Scenes separated by ***, ---, or blank lines (3+ newlines maybe?) or headers
        // Let's use *** and --- as explicit scene breaks, and headers
        
        const sceneBreaks = [
            ...text.matchAll(/(\n\s*[\*\-_]{3,}\s*\n)|(\n\s*#+\s+)/g)
        ];
        
        const scenes = [];
        let lastIndex = 0;

        for (const match of sceneBreaks) {
             const endIndex = match.index || text.length;
             const sceneText = text.slice(lastIndex, endIndex);
             const wordCount = (sceneText.match(/[\p{L}\p{N}'’-]+/gu) || []).length;
             if (wordCount > 10) { // Filter out empty/trivial segments
                 scenes.push({ start: lastIndex, end: endIndex, wordCount });
             }
             lastIndex = endIndex + match[0].length;
        }
        
        // Last scene
        if (lastIndex < text.length) {
            const sceneText = text.slice(lastIndex);
            const wordCount = (sceneText.match(/[\p{L}\p{N}'’-]+/gu) || []).length;
             if (wordCount > 10) {
                 scenes.push({ start: lastIndex, end: text.length, wordCount });
             }
        }

        return scenes;
    }
}
