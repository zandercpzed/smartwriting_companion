import { requestUrl /*, RequestUrlParam */ } from 'obsidian';
import { LLMStatus, CompletionOptions, SWCSettings } from '../types';

export class LLMGateway {
    private settings: SWCSettings;

    constructor(settings: SWCSettings) {
        this.settings = settings;
    }

    public updateSettings(settings: SWCSettings) {
        this.settings = settings;
    }

    public async checkConnection(): Promise<LLMStatus> {
        // Only checking Ollama for now as it's the local priority
        if (this.settings.llm.preferLocal) {
            try {
                const response = await requestUrl({
                url: `${this.settings.llm.ollamaBaseUrl}/api/tags`,
                    method: 'GET',
                    throw: false
                });

                if (response.status === 200) {
                    return {
                        provider: 'ollama',
                        isConnected: true,
                        isLocal: true,
                        modelName: this.settings.llm.ollamaModel,
                        lastChecked: new Date()
                    };
                }
            } catch (e) {
                // Fall through to cloud check or return error
            }
        }

        // TODO: Implement checks for cloud providers?
        // Usually we just assume cloud is "connected" if API key is present.
        
        const provider = this.settings.llm.defaultCloudProvider;
        const hasKey = this.getApiKey(provider);

        if (hasKey) {
            return {
                provider: provider,
                isConnected: true,
                isLocal: false,
                modelName: provider,
                lastChecked: new Date()
            };
        }

        return {
            provider: null,
            isConnected: false,
            isLocal: false,
            modelName: null,
            lastChecked: new Date(),
            error: 'No valid provider found'
        };
    }

    public async complete(prompt: string, options?: CompletionOptions): Promise<string> {
        const status = await this.checkConnection();
        if (!status.isConnected || !status.provider) {
            throw new Error('No LLM provider connected');
        }

        if (status.provider === 'ollama') {
            return this.completeOllama(prompt, options);
        } else if (status.provider === 'gemini') {
            return this.completeGemini(prompt, options);
        }
        
        throw new Error(`Provider ${status.provider} not yet implemented`);
    }

    private async completeOllama(prompt: string, options?: CompletionOptions): Promise<string> {
        const body = {
            model: this.settings.llm.ollamaModel,
            prompt: prompt,
            stream: false,
            options: {
                temperature: options?.temperature || 0.7,
                num_predict: options?.maxTokens || 2048
            },
            system: options?.systemPrompt
        };

        try {
            const response = await requestUrl({
                url: `${this.settings.llm.ollamaBaseUrl}/api/generate`,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.status === 200) {
                return JSON.parse(response.json).response;
            } else {
                throw new Error(`Ollama error: ${response.status}`);
            }
        } catch (error) {
             throw new Error(`Ollama connection failed: ${error}`);
        }
    }

    private async completeGemini(prompt: string, options?: CompletionOptions): Promise<string> {
        // POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}
         const model = 'gemini-pro'; // Or configurable
         const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.settings.llm.geminiApiKey}`;
         
         const body = {
             contents: [{
                 parts: [{ text: (options?.systemPrompt ? options.systemPrompt + "\\n\\n" : "") + prompt }]
             }],
             generationConfig: {
                 temperature: options?.temperature || 0.7,
                 maxOutputTokens: options?.maxTokens || 2048
             }
         };

         try {
            const response = await requestUrl({
                url: url,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.status === 200) {
                const data = response.json;
                return data.candidates[0].content.parts[0].text;
            } else {
                 throw new Error(`Gemini error: ${response.status}`);
            }
        } catch (error) {
             throw new Error(`Gemini request failed: ${error}`);
        }
    }

    private getApiKey(provider: string): string {
        switch (provider) {
            case 'gemini': return this.settings.llm.geminiApiKey;
            case 'openai': return this.settings.llm.openaiApiKey;
            case 'anthropic': return this.settings.llm.anthropicApiKey;
            default: return '';
        }
    }
}
