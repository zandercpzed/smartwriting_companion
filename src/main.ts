import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface SmartWriteSettings {
  exampleSetting: string;
}

const DEFAULT_SETTINGS: SmartWriteSettings = {
  exampleSetting: 'default'
}

export default class SmartWriteCompanion extends Plugin {
  settings: SmartWriteSettings;

  async onload() {
    await this.loadSettings();
    this.addCommand({
      id: 'smartwrite-sample-command',
      name: 'SmartWrite: Sample Command',
      callback: () => {
        new Notice('SmartWrite command executed');
      }
    });

    this.addSettingTab(new SampleSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class SampleSettingTab extends PluginSettingTab {
  plugin: SmartWriteCompanion;

  constructor(app: App, plugin: SmartWriteCompanion) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'SmartWrite Companion Settings' });

    new Setting(containerEl)
      .setName('Example Setting')
      .setDesc('An example setting for SmartWrite Companion')
      .addText(text => text
        .setPlaceholder('Enter a value')
        .setValue(this.plugin.settings.exampleSetting)
        .onChange(async (value) => {
          this.plugin.settings.exampleSetting = value;
          await this.plugin.saveSettings();
        }));
  }
}
