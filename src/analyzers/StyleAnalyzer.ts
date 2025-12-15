import { StyleMetrics, StyleIssue } from '../types';

/**
 * Detects style issues (100% local, zero dependencies)
 */
export class StyleAnalyzer {
    analyze(text: string): StyleMetrics {
        const passiveVoice = this.findPassiveVoice(text);
        const adverbs = this.findAdverbs(text);
        const filterWords = this.findFilterWords(text);
        const longSentences = this.findLongSentences(text);
        
        // These counts are approximate for speed
        const passiveVoiceCount = passiveVoice.length;
        const adverbCount = adverbs.length;
        const filterWordCount = filterWords.length;
        const longSentenceCount = longSentences.length;

        // Calculate simple stats for ratios
        const sentences = text.split(/[.?!]+(\s|$)/).filter(s => s.trim().length > 0);
        const words = text.match(/[\p{L}\p{N}'’-]+/gu) || [];
        
        const passiveVoicePercent = sentences.length > 0 ? (passiveVoiceCount / sentences.length) * 100 : 0;
        const adverbsPer1000 = words.length > 0 ? (adverbCount / words.length) * 1000 : 0;
        const averageSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;

        return {
            passiveVoiceCount,
            passiveVoicePercent,
            adverbCount,
            adverbsPer1000,
            filterWordCount,
            longSentenceCount,
            averageSentenceLength,
            issues: [...passiveVoice, ...adverbs, ...filterWords, ...longSentences]
        };
    }

    private findPassiveVoice(text: string): StyleIssue[] {
        const issues: StyleIssue[] = [];
        // PT: foi/foram/era + particípio, EN: was/were/been + participle
        // This is a naive regex approach. A full NLP parser would be better but expensive/heavy for this context.
        const ptPattern = /\b(foi|foram|é|são|era|eram|será|serão|sido|sendo)\s+(\w+(ado|ido|to))\b/gi;
        const enPattern = /\b(was|were|is|are|been|being)\s+(\w+(ed|en|own|ung))\b/gi;

        let match;
        while ((match = ptPattern.exec(text)) !== null) {
            issues.push({
                type: 'passive-voice',
                text: match[0],
                position: { start: match.index, end: match.index + match[0].length },
                severity: 'info',
                suggestion: 'Consider rewriting in active voice.'
            });
        }
        while ((match = enPattern.exec(text)) !== null) {
            issues.push({
                type: 'passive-voice',
                text: match[0],
                position: { start: match.index, end: match.index + match[0].length },
                severity: 'info',
                suggestion: 'Consider rewriting in active voice.'
            });
        }
        return issues;
    }

    private findAdverbs(text: string): StyleIssue[] {
        const issues: StyleIssue[] = [];
        // PT: -mente, EN: -ly
        // Naive 
        const pattern = /\b\w+(mente|ly)\b/gi;
        
        // Exclusions list
        const exclusions = new Set([
            'only', 'early', 'daily', 'friendly', 'likely', 'ugly', 'holy', 'family', 'silly', 'lovely',
            'simplesmente', 'realmente' // Some common PT ones might be debatable, but let's stick to basic structural check
        ]);

        let match;
        while ((match = pattern.exec(text)) !== null) {
            if (exclusions.has(match[0].toLowerCase())) continue;

            issues.push({
                type: 'adverb',
                text: match[0],
                position: { start: match.index, end: match.index + match[0].length },
                severity: 'info',
                suggestion: 'Is this adverb necessary? Can a stronger verb be used?'
            });
        }
        return issues;
    }

    private findFilterWords(text: string): StyleIssue[] {
        const issues: StyleIssue[] = [];
        const filterWords = ['viu', 'sentiu', 'percebeu', 'olhou', 'notou', 'ouviu', 
                             'saw', 'felt', 'noticed', 'looked', 'realized', 'heard'];
        
        const pattern = new RegExp(`\\b(${filterWords.join('|')})\\b`, 'gi');

        let match;
        while ((match = pattern.exec(text)) !== null) {
            issues.push({
                type: 'filter-word',
                text: match[0],
                position: { start: match.index, end: match.index + match[0].length },
                severity: 'info',
                suggestion: 'Filter word: creates distance. Describe the sensation directly.'
            });
        }
        return issues;
    }

    private findLongSentences(text: string, threshold = 40): StyleIssue[] {
        const issues: StyleIssue[] = [];
        // Split by punctuation that ends a sentence, capturing the index roughly
        // Ideally we iterate through the text to preserve positions
        
        // Simple iteration to find sentence boundaries and their lengths
        // We'll trust the main split logic broadly, but for precise highlighting we might need more care.
        // For now, let's just find the text segments.
        
        const sentencesMatches = text.matchAll(/[^.?!]+[.?!]+(\s|$)/g);
        for (const match of sentencesMatches) {
            const sentence = match[0];
            const wordCount = (sentence.match(/[\p{L}\p{N}'’-]+/gu) || []).length;
            
            if (wordCount > threshold) {
                issues.push({
                    type: 'long-sentence',
                    text: sentence.trim(),
                    position: { start: match.index || 0, end: (match.index || 0) + sentence.length },
                    severity: 'warning',
                    suggestion: `Long sentence (${wordCount} words). Consider splitting.`
                });
            }
        }

        return issues;
    }
}
