import { TextCleanup } from '../analyzers';
import { CleanupResult, CleanupSuggestion, SWCSettings } from '../types';

export class CleanupService {
    private textCleanup: TextCleanup;
    private settings: SWCSettings;

    constructor(settings: SWCSettings) {
        this.settings = settings;
        this.textCleanup = new TextCleanup();
    }
    
    public updateSettings(settings: SWCSettings) {
        this.settings = settings;
    }

    public analyze(text: string): CleanupResult {
        return this.textCleanup.analyze(text);
    }

    public clean(text: string): string {
        // Here we could respect specific settings to selectively disable certain cleanups
        // For now, using the default full clean from the analyzer
        const cleaned = text;
        
        // This logic should ideally be inside TextCleanup.clean taking options, 
        // or we manually orchestration here.
        // For now, trusting the analyzer's defaults which match our standard rules.
        return this.textCleanup.clean(text);
    }
    
    public applySuggestion(text: string, suggestion: CleanupSuggestion): string {
        return this.textCleanup.applySuggestions(text, [suggestion]);
    }
}
