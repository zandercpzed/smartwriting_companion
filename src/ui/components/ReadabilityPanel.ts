// ReadabilityPanel.ts
// Panel for displaying readability scores

import { BasePanel } from './BasePanel';

export class ReadabilityPanel extends BasePanel {
  render(): void {
    this.containerEl.textContent = 'Readability Scores Content';
  }

  update(data: any): void {
    // Update panel with new data
  }
}