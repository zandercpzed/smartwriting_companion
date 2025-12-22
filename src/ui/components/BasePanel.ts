// BasePanel.ts
// Abstract class for SmartWrite Companion panels

export abstract class BasePanel {
  containerEl: HTMLElement;
  isCollapsed: boolean;
  title: string;

  constructor(containerEl: HTMLElement, title: string) {
    this.containerEl = containerEl;
    this.title = title;
    this.isCollapsed = false;
  }

  abstract render(): void;
  abstract update(data: any): void;

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    // Update UI accordingly
  }

  createHeader(): HTMLElement {
    const header = document.createElement('div');
    header.textContent = this.title;
    header.addEventListener('click', () => this.toggleCollapse());
    return header;
  }

  createContent(): HTMLElement {
    const content = document.createElement('div');
    content.textContent = 'Panel content';
    return content;
  }

  show(): void {
    this.containerEl.style.display = '';
  }

  hide(): void {
    this.containerEl.style.display = 'none';
  }
}