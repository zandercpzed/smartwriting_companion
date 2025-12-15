import { ReadabilityMetrics } from '../types';
// Try to use the 'syllable' package for improved syllable counting; fallback to heuristic
let syllableLib: ((word: string) => number) | null = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    syllableLib = require('syllable');
} catch (e) {
    syllableLib = null;
}

/**
 * Calculates readability metrics (100% local, zero dependencies)
 */
export class ReadabilityAnalyzer {
    analyze(text: string, words: number, sentences: number): ReadabilityMetrics {
        if (words === 0 || sentences === 0) {
            return {
                fleschKincaid: 0,
                fleschReadingEase: 0,
                gunningFog: 0,
                smog: 0,
                colemanLiau: 0,
                automatedReadability: 0,
                daleChall: 0
            };
        }

        const syllables = this.countTotalSyllables(text);
        const complexWords = this.countComplexWords(text);
        const characters = text.replace(/\s/g, '').length;
        const polysyllables = this.countPolysyllables(text);

        // Averages
        const wordsPerSentence = words / sentences;
        const syllablesPerWord = syllables / words;
        const lettersPer100Words = (characters / words) * 100;
        const sentencesPer100Words = (sentences / words) * 100;

        // Flesch-Kincaid Grade Level
        // 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
        const fleschKincaid = (0.39 * wordsPerSentence) + (11.8 * syllablesPerWord) - 15.59;

        // Flesch Reading Ease
        // 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
        const fleschReadingEase = 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);

        // Gunning Fog
        // 0.4 * ((words/sentences) + 100 * (complexWords/words))
        const gunningFog = 0.4 * (wordsPerSentence + (100 * (complexWords / words)));

        // SMOG
        // 1.0430 * sqrt(polysyllables * (30/sentences)) + 3.1291
        const smog = 1.0430 * Math.sqrt(polysyllables * (30 / sentences)) + 3.1291;

        // Coleman-Liau
        // 0.0588 * L - 0.296 * S - 15.8
        const colemanLiau = (0.0588 * lettersPer100Words) - (0.296 * sentencesPer100Words) - 15.8;

        // ARI (Automated Readability Index)
        // 4.71 * (chars/words) + 0.5 * (words/sentences) - 21.43
        const automatedReadability = (4.71 * (characters / words)) + (0.5 * wordsPerSentence) - 21.43;

        // Dale-Chall (Simulated without full list lookup due to local constraints, relying on length/complexity proxy for now or a small list if we add one)
        // Ideally needs a list of 3000 words. For now, using complex words as proxy for "difficult words"
        // 0.1579 * difficultPercent + 0.0496 * avgSentenceLength (+ 3.6365 if difficultPercent > 5)
        const difficultPercent = (complexWords / words) * 100;
        let daleChall = (0.1579 * difficultPercent) + (0.0496 * wordsPerSentence);
        if (difficultPercent > 5) {
            daleChall += 3.6365;
        }

        return {
            fleschKincaid: Number(fleschKincaid.toFixed(1)),
            fleschReadingEase: Number(fleschReadingEase.toFixed(1)),
            gunningFog: Number(gunningFog.toFixed(1)),
            smog: Number(smog.toFixed(1)),
            colemanLiau: Number(colemanLiau.toFixed(1)),
            automatedReadability: Number(automatedReadability.toFixed(1)),
            daleChall: Number(daleChall.toFixed(1))
        };
    }

    private countSyllables(word: string): number {
        if (syllableLib) {
            try {
                return Math.max(1, syllableLib(word));
            } catch (_e) {
                // fallthrough to heuristic
            }
        }

        word = word.toLowerCase().replace(/[^a-záéíóúâêîôûãõàèìòùäëïöü]/g, '');
        if (word.length <= 3) return 1;
        const matches = word.match(/[aeiouyáéíóúâêîôûãõàèìòùäëïöü]+/g);
        return matches ? matches.length : 1;
    }

    private countTotalSyllables(text: string): number {
        const words = text.match(/[\p{L}\p{N}']+/gu) || [];
        return (words as string[]).reduce((sum, word) => sum + this.countSyllables(word), 0);
    }

    private countComplexWords(text: string): number {
        // Words with 3 or more syllables
        const words = text.match(/[\p{L}\p{N}']+/gu) || [];
        return words.filter(word => this.countSyllables(word) >= 3).length;
    }
    
    private countPolysyllables(text: string): number {
         // Words with 3 or more syllables (SMOG usually counts 3+)
        const words = text.match(/[\p{L}\p{N}']+/gu) || [];
        return words.filter(word => this.countSyllables(word) >= 3).length;
    }
}
