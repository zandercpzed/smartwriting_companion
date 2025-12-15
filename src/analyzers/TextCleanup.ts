import { CleanupResult, CleanupSuggestion } from '../types';

/**
 * Text normalization (100% local, zero dependencies)
 */
export class TextCleanup {
    analyze(text: string): CleanupResult {
        const suggestions: CleanupSuggestion[] = [];
        
        // Use a "dry run" of replacements logic to generate suggestions
        // This is a bit inefficient (regex matching twice) but keeps logic clean.
        // A better way is to match and push suggestion.
        
        this.checkRegex(text, /"|'/g, 'quote', 'Straight quotes used', suggestions);
        this.checkRegex(text, /--/g, 'dash', 'Double dash used (should be em-dash)', suggestions);
        this.checkRegex(text, /\.\.\./g, 'ellipsis', 'Three periods used (should be ellipsis char)', suggestions);
        this.checkRegex(text, /[ \t]+$/gm, 'whitespace', 'Trailing whitespace', suggestions);
        this.checkRegex(text, /  +/g, 'whitespace', 'Multiple spaces', suggestions);

        return {
            suggestions,
            stats: {
                quotes: suggestions.filter(s => s.type === 'quote').length,
                dashes: suggestions.filter(s => s.type === 'dash').length,
                ellipsis: suggestions.filter(s => s.type === 'ellipsis').length,
                whitespace: suggestions.filter(s => s.type === 'whitespace').length,
                controlChars: suggestions.filter(s => s.type === 'control-char').length,
                total: suggestions.length
            }
        };
    }

    clean(text: string): string {
        let cleaned = text;

        // Smart quotes (this is simplified, might replace indiscriminately without context)
        // A better implementation needs to distinguish open vs close quotes.
        // Opening: start of line or after space/dash/char
        // Closing: after word char
        cleaned = cleaned.replace(/(\s|^)"/g, '$1“').replace(/"/g, '”');
        cleaned = cleaned.replace(/(\s|^)'/g, '$1‘').replace(/'/g, '’');
        
        // Dashes
        cleaned = cleaned.replace(/ -- /g, ' — '); // Spaced em-dash
        cleaned = cleaned.replace(/--/g, '—');
        
        // Ellipsis
        cleaned = cleaned.replace(/\.\.\./g, '…');
        
        // Whitespace
        cleaned = cleaned.replace(/[ \t]+$/gm, '');
        cleaned = cleaned.replace(/  +/g, ' ');
        
        return cleaned;
    }
    
    private checkRegex(text: string, regex: RegExp, type: any, desc: string, suggestions: CleanupSuggestion[]) {
        let match;
        // Reset lastIndex if global
        const re = new RegExp(regex);
        while ((match = re.exec(text)) !== null) {
            suggestions.push({
                id: `cleanup-${suggestions.length}`,
                type,
                original: match[0],
                replacement: '', // Would need specific logic to know *what* to replace with exactly in specific contexts
                position: { start: match.index, end: match.index + match[0].length },
                description: desc
            });
             if (!re.global) break;
        }
    }

    applySuggestions(text: string, suggestions: CleanupSuggestion[]): string {
        // Apply in reverse order to preserve indices
        const sorted = [...suggestions].sort((a, b) => b.position.start - a.position.start);
        let result = text;
        
        for (const suggestion of sorted) {
             const before = result.slice(0, suggestion.position.start);
             const after = result.slice(suggestion.position.end);
             // Note: simplistic application, presumes replacement is known/handled or we just use a generic 'clean' call logic
             // Ideally 'Suggestion' should carry the replacement string.
             // For now, this method is a placeholder as full interactive cleanup is complex.
             result = before + suggestion.replacement + after; 
        }
        return result;
    }
}
