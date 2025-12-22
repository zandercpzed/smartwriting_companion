// SidebarView.ts
// Main container for SmartWrite Companion Plugin

import { ItemView } from 'obsidian';

export const VIEW_TYPE = 'smartwrite-sidebar';

export class SidebarView extends ItemView {
  constructor(leaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return 'SmartWrite Sidebar';
  }

  getIcon() {
    return 'pencil';
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl('div', { text: 'SmartWrite Sidebar Content' });
  }

  async onClose() {
    // Cleanup resources here
  }
}