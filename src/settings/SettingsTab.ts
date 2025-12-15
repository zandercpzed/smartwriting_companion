import { App, PluginSettingTab, Setting } from 'obsidian';
import SmartWritingCompanion from '../../main';

export class SWCSettingTab extends PluginSettingTab {
    plugin: SmartWritingCompanion;

    constructor(app: App, plugin: SmartWritingCompanion) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Smart Writing Companion Settings' });

        // LLM Settings
        containerEl.createEl('h3', { text: 'LLM Configuration' });

        new Setting(containerEl)
            .setName('Prefer Local LLM (Ollama)')
            .setDesc('Attempt to use Ochlama before falling back to cloud providers')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.llm.preferLocal)
                .onChange(async (value) => {
                    this.plugin.settings.llm.preferLocal = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Ollama Base URL')
            .setDesc('URL for your local Ollama instance')
            .addText(text => text
                .setPlaceholder('http://localhost:11434')
                .setValue(this.plugin.settings.llm.ollamaBaseUrl)
                .onChange(async (value) => {
                    this.plugin.settings.llm.ollamaBaseUrl = value;
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName('Ollama Model')
            .setDesc('Model to use with Ollama')
            .addText(text => text
                .setPlaceholder('qwen2.5:7b')
                .setValue(this.plugin.settings.llm.ollamaModel)
                .onChange(async (value) => {
                    this.plugin.settings.llm.ollamaModel = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Default Cloud Provider')
            .setDesc('Provider to use if local LLM is unavailable or disabled')
            .addDropdown(dropdown => dropdown
                .addOption('gemini', 'Google Gemini')
                .addOption('openai', 'OpenAI')
                .addOption('anthropic', 'Anthropic')
                .setValue(this.plugin.settings.llm.defaultCloudProvider)
                .onChange(async (value: any) => {
                    this.plugin.settings.llm.defaultCloudProvider = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Gemini API Key')
            .setDesc('API Key for Google Gemini')
            .addText(text => text
                .setPlaceholder('API Key')
                .setValue(this.plugin.settings.llm.geminiApiKey)
                .onChange(async (value) => {
                    this.plugin.settings.llm.geminiApiKey = value;
                    await this.plugin.saveSettings();
                }));
        
        // Analysis Settings
        containerEl.createEl('h3', { text: 'Analysis Thresholds' });

        new Setting(containerEl)
            .setName('Max Sentence Length')
            .setDesc('Sentences longer than this will be flagged')
            .addText(text => text
                .setPlaceholder('40')
                .setValue(String(this.plugin.settings.analysis.maxSentenceLength))
                .onChange(async (value) => {
                    const num = parseInt(value);
                    if (!isNaN(num)) {
                         this.plugin.settings.analysis.maxSentenceLength = num;
                        await this.plugin.saveSettings();
                    }
                }));

        // Cleanup Settings
        containerEl.createEl('h3', { text: 'Auto-Cleanup' });

        new Setting(containerEl)
            .setName('Normalize Quotes')
            .setDesc('Convert straight quotes to curly quotes')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.cleanup.normalizeQuotes)
                .onChange(async (value) => {
                    this.plugin.settings.cleanup.normalizeQuotes = value;
                    await this.plugin.saveSettings();
                }));
    }
}
