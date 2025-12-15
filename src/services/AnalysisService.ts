import { StatisticsAnalyzer, ReadabilityAnalyzer, StyleAnalyzer, FictionAnalyzer } from '../analyzers';
import { FullAnalysis, SWCSettings, DocumentStats, ReadabilityMetrics, StyleMetrics, FictionMetrics } from '../types';

export class AnalysisService {
    private statsAnalyzer: StatisticsAnalyzer;
    private readabilityAnalyzer: ReadabilityAnalyzer;
    private styleAnalyzer: StyleAnalyzer;
    private fictionAnalyzer: FictionAnalyzer;
    private settings: SWCSettings;

    constructor(settings: SWCSettings) {
        this.settings = settings;
        this.statsAnalyzer = new StatisticsAnalyzer();
        this.readabilityAnalyzer = new ReadabilityAnalyzer();
        this.styleAnalyzer = new StyleAnalyzer();
        this.fictionAnalyzer = new FictionAnalyzer();
    }

    public updateSettings(settings: SWCSettings) {
        this.settings = settings;
    }

    public analyze(text: string): FullAnalysis {
        // Run all analyzers
        // In a real scenario, this might be async or chunked to avoid freezing UI on huge docs
        
        const stats: DocumentStats = this.statsAnalyzer.analyze(text);
        const readability: ReadabilityMetrics = this.readabilityAnalyzer.analyze(text, stats.words, stats.sentences);
        const style: StyleMetrics = this.styleAnalyzer.analyze(text);
        const fiction: FictionMetrics = this.fictionAnalyzer.analyze(text);

        // Filter style issues based on settings if needed
        // For example, filtering out "allowed" filter words
        
        return {
            stats,
            readability,
            style,
            fiction,
            analyzedAt: new Date(),
            documentHash: this.simpleHash(text)
        };
    }

    private simpleHash(text: string): string {
        let hash = 0, i, chr;
        if (text.length === 0) return hash.toString();
        for (i = 0; i < text.length; i++) {
            chr = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString();
    }
}
