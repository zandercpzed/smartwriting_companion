import { LLMGateway } from '../gateway';
import { PersonaEvaluation, PersonaId, SWCSettings } from '../types';

export class PersonaService {
    private gateway: LLMGateway;
    private settings: SWCSettings;

    private personas: Record<string, string> = {
        'booktuber': 'You are a lively, energetic BookTuber who reviews fiction. You focus on hooks, pacing, and "vibes". You use emoji and slang. You care if the book is "bingeable".',
        'hardcore': 'You are a hardcore sci-fi/fantasy reader. You obsess over worldbuilding consistency, magic systems, and logical plot progression. You hate plotholes and "hand-waving".',
        'casual': 'You are a casual reader who reads for fun on the commute. You want simple, clear prose and engaging characters. You dislike confusion or purple prose.'
    };

    constructor(settings: SWCSettings, gateway: LLMGateway) {
        this.settings = settings;
        this.gateway = gateway;
    }

    public updateSettings(settings: SWCSettings) {
        this.settings = settings;
    }

    public async evaluate(text: string, personaId: PersonaId): Promise<PersonaEvaluation> {
        const systemPrompt = this.personas[personaId];
        if (!systemPrompt) {
            throw new Error(`Persona ${personaId} not found`);
        }

        const prompt = `
Read the following text excerpt and evaluate it based on your persona.
Provide a JSON response with the following structure:
{
    "rating": (1-5 number),
    "summary": "One sentence summary of your impression",
    "strengths": ["point 1", "point 2"],
    "weaknesses": ["point 1", "point 2"],
    "fullEvaluation": "A paragraph explaining your thoughts in your persona's voice"
}

Text to evaluate:
---
${text}
---
`;

        try {
            const resultRaw = await this.gateway.complete(prompt, {
                systemPrompt: systemPrompt
            });
            
            // Clean up potentially messy JSON response (some LLMs add markdown code blocks)
            const jsonStr = resultRaw.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(jsonStr);

            return {
                personaId,
                personaName: personaId.charAt(0).toUpperCase() + personaId.slice(1),
                rating: result.rating,
                summary: result.summary,
                strengths: result.strengths,
                weaknesses: result.weaknesses,
                fullEvaluation: result.fullEvaluation,
                evaluatedAt: new Date()
            };

        } catch (error) {
            console.error('Persona evaluation failed', error);
            throw error;
        }
    }
}
