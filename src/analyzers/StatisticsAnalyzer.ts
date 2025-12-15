import { DocumentStats } from '../types';

/**
 * Calculates basic document statistics (100% local, zero dependencies)
 */
export class StatisticsAnalyzer {
    analyze(text: string): DocumentStats {
        const words = this.countWords(text);
        const sentences = this.countSentences(text);
        const paragraphs = this.countParagraphs(text);
        const characters = text.length;
        const charactersNoSpaces = text.replace(/\s/g, '').length;
        const readingTimeMinutes = this.calculateReadingTime(words);

        return {
            words,
            characters,
            charactersNoSpaces,
            sentences,
            paragraphs,
            readingTimeMinutes,
        };
    }

    private countWords(text: string): number {
        // Strip markdown before counting
        const cleanText = this.stripMarkdown(text);
        if (!cleanText.trim()) return 0;
        
        // Count words, handling contractions and hyphenated words
        // This regex matches words including those with apostrophes or internal hyphens
        // \p{L} matches any unicode letter
        return (cleanText.match(/[\p{L}\p{N}'’-]+/gu) || []).length;
    }

    private countSentences(text: string): number {
        const cleanText = this.stripMarkdown(text);
        if (!cleanText.trim()) return 0;

        // Basic sentence splitting, but ignoring common abbreviations
        // This is a simplified approach; a robust solution might need a better tokenizer
        // matches . ? or ! followed by space or end of string
        const sentences = cleanText.split(/[.?!]+(\s|$)/).filter(s => s.trim().length > 0);
        return sentences.length;
    }

    private countParagraphs(text: string): number {
        // Obsidian style: split by double newline
        return text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    }

    private calculateReadingTime(words: number): number {
        // Standard fiction reading speed: 200 words per minute
        return Math.ceil(words / 200);
    }

    private stripMarkdown(text: string): string {
        // Simple markdown stripper
            const clean = text
            // Headers
            .replace(/^#+\s+/gm, '')
            // Bold/Italic
                .replace(/(\*\*|__)(.*?)\1/g, '$2')
                .replace(/(\*|_)(.*?)\1/g, '$2')
            // Links
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            // Images
            .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
            // Blockquotes
            .replace(/^>\s+/gm, '')
            // Code blocks
            .replace(/```[\s\S]*?```/g, '')
            .replace(/`([^`]+)`/g, '$1');
            
        return clean;
    }
}
