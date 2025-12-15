import { Plugin, WorkspaceLeaf } from 'obsidian';
import { SWCSettings, DEFAULT_SETTINGS } from './src/types/settings';
import { SWCSettingTab } from './src/settings/SettingsTab';
import { CompanionView, VIEW_TYPE_COMPANION } from './src/views/CompanionView';
import { AnalysisService, CleanupService, PersonaService } from './src/services';
import { LLMGateway } from './src/gateway';

export default class SmartWritingCompanion extends Plugin {
	settings: SWCSettings;
	analysisService: AnalysisService;
	cleanupService: CleanupService;
	personaService: PersonaService;
	llmGateway: LLMGateway;

	async onload() {
		await this.loadSettings();

		// Initialize services
		this.analysisService = new AnalysisService(this.settings);
		this.cleanupService = new CleanupService(this.settings);
		this.llmGateway = new LLMGateway(this.settings);
		this.personaService = new PersonaService(this.settings, this.llmGateway);

		this.registerView(
			VIEW_TYPE_COMPANION,
			(leaf) => new CompanionView(leaf, this)
		);

		this.addRibbonIcon('book-open', 'SmartWriting Companion', () => {
			this.activateView();
		});

		this.addCommand({
			id: 'open-smart-writing-companion',
			name: 'Open SmartWriting Companion',
			callback: () => {
				this.activateView();
			}
		});

		this.addSettingTab(new SWCSettingTab(this.app, this));

        // Add header icon to markdown views
        this.registerEvent(this.app.workspace.on('file-open', (file) => {
             const leaf = this.app.workspace.getLeaf(false);
             if (leaf) this.addIconToHeader(leaf);
        }));
        this.registerEvent(this.app.workspace.on('active-leaf-change', (leaf) => {
            if (leaf) this.addIconToHeader(leaf);
        }));
        
        // Add to existing
        this.app.workspace.onLayoutReady(() => {
             this.app.workspace.iterateAllLeaves((leaf) => {
                 this.addIconToHeader(leaf);
             });
        });
	}

	async onunload() {
        // Clean up icons if needed, though they usually disappear with the view or on disable
	}

    addIconToHeader(leaf: WorkspaceLeaf) {
        if (!leaf.view) return;
        // Check if it's a MarkdownView (or loose check for having addAction)
        if (leaf.view.getViewType() === 'markdown') {
            const view = leaf.view as any;
            // Avoid duplicates: check if we already added it. 
            // Since we can't easily check internal state, checking the DOM for a unique class or tooltip is a way.
            const existing = view.containerEl.querySelector('.swc-header-action');
            if (existing) return;

            const action = view.addAction('book-open', 'Open SmartWriting Companion', () => {
                this.activateView();
            });
            action.classList.add('swc-header-action');
        }
    }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_COMPANION);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				leaf = rightLeaf;
				await leaf.setViewState({ type: VIEW_TYPE_COMPANION, active: true });
			}
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}
}
