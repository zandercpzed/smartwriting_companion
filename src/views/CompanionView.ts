import { ItemView, WorkspaceLeaf, TFile, Debouncer, debounce } from 'obsidian';
import type SmartWritingCompanion from '../../main';
import { FullAnalysis } from '../types';

export const VIEW_TYPE_COMPANION = "smart-writing-companion-view";

export class CompanionView extends ItemView {
    plugin: SmartWritingCompanion;
    private debouncedAnalyze: (text: string) => void;

	constructor(leaf: WorkspaceLeaf, plugin: SmartWritingCompanion) {
		super(leaf);
        this.plugin = plugin;
        this.debouncedAnalyze = debounce((text: string) => this.runAnalysis(text), 1000, true);
	}

	getViewType() {
		return VIEW_TYPE_COMPANION;
	}

	getDisplayText() {
		return "SmartWriting Companion";
	}

	async onOpen() {
		const container = this.containerEl;
		container.empty();
        this.renderInitial(container);

        // Register events
        this.registerEvent(this.app.workspace.on('active-leaf-change', () => this.checkActiveFile()));
        this.registerEvent(this.app.workspace.on('editor-change', (editor) => {
             this.debouncedAnalyze(editor.getValue());
        }));
        
        // Initial check
        this.checkActiveFile();
	}

    renderInitial(container: HTMLElement) {

		container.innerHTML = `
    <div class="sidebar-wrapper">
        <aside class="sidebar">
            <div class="swc-companion">
                
                <!-- HEADER -->
                <header class="swc-header">
                    <div class="swc-header__left">
                        <span class="swc-header__icon">✏️</span>
                        <h1 class="swc-header__title">Smart Writing</h1>
                    </div>
                </header>

                <!-- DOCUMENT CARD -->
                <div class="swc-document-card">
                    <div class="swc-document-card__filename">
                        <span class="swc-document-card__icon">📄</span>
                        <span>--</span>
                    </div>
                    <div class="swc-document-card__stats">-</div>
                </div>

                <!-- READABILITY SECTION -->
                <section class="swc-section" id="readabilitySection">
                    <div class="swc-section__header" data-section="readabilitySection">
                        <svg class="swc-section__chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                        <span class="swc-section__title">Legibilidade</span>
                        <span class="swc-section__badge">-</span>
                    </div>
                    <div class="swc-section__content">
                        <div class="swc-meter">
                            <div class="swc-meter__header">
                                <span class="swc-meter__label">Flesch-Kincaid</span>
                                <span class="swc-meter__value">-</span>
                            </div>
                            <div class="swc-meter__track">
                                <div class="swc-meter__fill" style="width: 0%;"></div>
                            </div>
                            <div class="swc-meter__hint">Ideal: 7-9</div>
                            <div class="swc-meter__tooltip" style="display:none;">Metrics</div>
                        </div>

                        <div class="swc-metric">
                            <div class="swc-metric__dot"></div>
                            <span class="swc-metric__label">Voz passiva</span>
                            <span class="swc-metric__value">-</span>
                        </div>
                        <div class="swc-metric">
                            <div class="swc-metric__dot"></div>
                            <span class="swc-metric__label">Advérbios</span>
                            <span class="swc-metric__value">-</span>
                        </div>
                        <div class="swc-metric">
                            <div class="swc-metric__dot"></div>
                            <span class="swc-metric__label">Frases longas</span>
                            <span class="swc-metric__value">-</span>
                        </div>
                    </div>
                </section>

                <!-- ACTION GRID -->
                <div class="swc-actions">
                    <div class="swc-actions__grid">
                        <button class="swc-action-btn swc-action-btn--primary">
                            <span class="swc-action-btn__icon">🔍</span>
                            <span>Analisar Agora</span>
                        </button>
                    </div>
                </div>

            </div>
        </aside>
    </div>
		`;
        
        this.containerEl.querySelectorAll('.swc-section__header').forEach(el => {
            el.addEventListener('click', () => {
                const sectionId = (el as HTMLElement).getAttribute('data-section');
                if (sectionId) {
                    const section = this.containerEl.querySelector(`#${sectionId}`);
                    if (section) {
                        section.classList.toggle('swc-section--collapsed');
                    }
                }
            });
        });
	}

    async checkActiveFile() {
        const file = this.app.workspace.getActiveFile();
        if (file instanceof TFile && (file.extension === 'md' || file.extension === 'txt')) {
             const content = await this.app.vault.read(file);
             this.updateDocumentInfo(file);
             this.runAnalysis(content);
        }
    }
    
    updateDocumentInfo(file: TFile) {
        const nameEl = this.containerEl.querySelector('.swc-document-card__filename span:nth-child(2)');
        if (nameEl) nameEl.textContent = file.name;
    }

    async runAnalysis(text: string) {
        if (!text) return;
        
        // Run analysis via service
        const results: FullAnalysis = this.plugin.analysisService.analyze(text);
        
        this.updateUI(results);
    }
    
    updateUI(results: FullAnalysis) {
        // Update Stats
        const statsEl = this.containerEl.querySelector('.swc-document-card__stats');
        if (statsEl) {
            statsEl.textContent = `${results.stats.words.toLocaleString()} palavras • ${results.stats.readingTimeMinutes} min leitura`;
        }
        
        // Update Readability
        const fkValue = this.containerEl.querySelector('.swc-meter__value');
        const fkFill = this.containerEl.querySelector('.swc-meter__fill') as HTMLElement;
        if (fkValue) fkValue.textContent = results.readability.fleschKincaid.toString();
        if (fkFill) {
            // Sigmoid-like mapping centered at 8 to avoid saturation for high FK
            const fk = results.readability.fleschKincaid;
            const percent = Math.round(100 * (1 / (1 + Math.exp(- (fk - 8) / 3))));
            fkFill.style.width = `${percent}%`;
            
            // Color coding
            fkFill.className = 'swc-meter__fill'; // reset
            if (results.readability.fleschKincaid >= 7 && results.readability.fleschKincaid <= 9) {
                fkFill.classList.add('swc-meter__fill--good');
            } else if (results.readability.fleschKincaid < 5 || results.readability.fleschKincaid > 12) {
                 fkFill.classList.add('swc-meter__fill--bad');
            } else {
                 fkFill.classList.add('swc-meter__fill--ok');
            }
            // Populate tooltip with raw metrics
            const tooltip = this.containerEl.querySelector('.swc-meter__tooltip');
            if (tooltip) {
                tooltip.textContent = `Flesch ${results.readability.fleschKincaid}, F-Read ${results.readability.fleschReadingEase}, Gunning ${results.readability.gunningFog}, SMOG ${results.readability.smog}`;
                // show tooltip on hover
                const parent = fkFill.parentElement;
                if (parent) {
                    parent.addEventListener('mouseenter', () => { if (tooltip) (tooltip as HTMLElement).style.display = 'block'; });
                    parent.addEventListener('mouseleave', () => { if (tooltip) (tooltip as HTMLElement).style.display = 'none'; });
                }
            }
        }
        
        // Update Metrics
        const passiveStatus = results.style.passiveVoicePercent > this.plugin.settings.analysis.maxPassiveVoicePercent ? 'bad' : 'good';
        this.updateMetric('Voz passiva', `${results.style.passiveVoicePercent.toFixed(1)}%`, passiveStatus);

        const adverbStatus = results.style.adverbsPer1000 > this.plugin.settings.analysis.maxAdverbsPer1000 ? 'bad' : 'good';
        this.updateMetric('Advérbios', `${results.style.adverbsPer1000.toFixed(0)}/1000`, adverbStatus);
            
        this.updateMetric('Frases longas', results.style.longSentenceCount.toString(), 
             results.style.longSentenceCount > 0 ? 'bad' : 'good');
    }

    updateMetric(label: string, value: string, status: 'good' | 'ok' | 'bad') {
        const metrics = this.containerEl.querySelectorAll('.swc-metric');
        for (let i = 0; i < metrics.length; i++) {
            const metric = metrics[i];
            const labelEl = metric.querySelector('.swc-metric__label');
            if (labelEl && labelEl.textContent === label) {
                const valueEl = metric.querySelector('.swc-metric__value');
                const dotEl = metric.querySelector('.swc-metric__dot');
                if (valueEl) valueEl.textContent = value;
                if (dotEl) {
                    dotEl.className = 'swc-metric__dot';
                    dotEl.classList.add(`swc-metric__dot--${status}`);
                }
                break;
            }
        }
    }
}
