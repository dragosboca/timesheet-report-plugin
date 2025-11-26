// Mock for Obsidian API used in tests

export class TFile {
  path: string;
  name: string;
  basename: string;
  extension: string;

  constructor(path: string) {
    this.path = path;
    this.name = path.split('/').pop() || '';
    this.basename = this.name.replace(/\.[^/.]+$/, '');
    this.extension = this.name.split('.').pop() || '';
  }
}

export class TFolder {
  path: string;
  name: string;

  constructor(path: string) {
    this.path = path;
    this.name = path.split('/').pop() || '';
  }
}

export class Vault {
  getAbstractFileByPath(path: string): TFile | null {
    return new TFile(path);
  }

  getMarkdownFiles(): TFile[] {
    return [];
  }

  read(file: TFile): Promise<string> {
    return Promise.resolve('');
  }

  create(path: string, data: string): Promise<TFile> {
    return Promise.resolve(new TFile(path));
  }

  modify(file: TFile, data: string): Promise<void> {
    return Promise.resolve();
  }
}

export class MetadataCache {
  getFileCache(file: TFile): any {
    return null;
  }

  getCache(path: string): any {
    return null;
  }
}

export class App {
  vault: Vault;
  metadataCache: MetadataCache;

  constructor() {
    this.vault = new Vault();
    this.metadataCache = new MetadataCache();
  }
}

export class Plugin {
  app: App;
  manifest: any;

  constructor() {
    this.app = new App();
    this.manifest = {};
  }

  loadData(): Promise<any> {
    return Promise.resolve({});
  }

  saveData(data: any): Promise<void> {
    return Promise.resolve();
  }
}

export class Notice {
  constructor(message: string | DocumentFragment, timeout?: number) {
    // Mock implementation
  }
}

export class Modal {
  app: App;
  containerEl: HTMLElement;

  constructor(app: App) {
    this.app = app;
    this.containerEl = document.createElement('div');
  }

  open(): void { }
  close(): void { }
  onOpen(): void { }
  onClose(): void { }
}

export class Setting {
  settingEl: HTMLElement;

  constructor(containerEl: HTMLElement) {
    this.settingEl = document.createElement('div');
  }

  setName(name: string): this {
    return this;
  }

  setDesc(desc: string): this {
    return this;
  }

  addText(cb: (text: any) => any): this {
    const component = {
      setValue: (value: string) => component,
      onChange: (cb: (value: string) => any) => component
    };
    cb(component);
    return this;
  }

  addToggle(cb: (toggle: any) => any): this {
    const component = {
      setValue: (value: boolean) => component,
      onChange: (cb: (value: boolean) => any) => component
    };
    cb(component);
    return this;
  }

  addDropdown(cb: (dropdown: any) => any): this {
    const component = {
      addOption: (value: string, display: string) => component,
      setValue: (value: string) => component,
      onChange: (cb: (value: string) => any) => component
    };
    cb(component);
    return this;
  }

  addButton(cb: (button: any) => any): this {
    const component = {
      setButtonText: (text: string) => component,
      onClick: (cb: () => any) => component
    };
    cb(component);
    return this;
  }
}

export class PluginSettingTab {
  app: App;
  plugin: Plugin;
  containerEl: HTMLElement;

  constructor(app: App, plugin: Plugin) {
    this.app = app;
    this.plugin = plugin;
    this.containerEl = document.createElement('div');
  }

  display(): void { }
  hide(): void { }
}

export interface WorkspaceLeaf {
  view: any;
}

export class ItemView {
  leaf: WorkspaceLeaf;
  containerEl: HTMLElement;

  constructor(leaf: WorkspaceLeaf) {
    this.leaf = leaf;
    this.containerEl = document.createElement('div');
  }

  getViewType(): string {
    return 'unknown';
  }

  getDisplayText(): string {
    return '';
  }

  onOpen(): Promise<void> {
    return Promise.resolve();
  }

  onClose(): Promise<void> {
    return Promise.resolve();
  }
}

export interface MarkdownPostProcessorContext {
  sourcePath: string;
  frontmatter: any;
  addChild(child: any): void;
  getSectionInfo(el: HTMLElement): any;
}

export const moment = {
  unix: (timestamp: number) => ({
    format: (format: string) => new Date(timestamp * 1000).toISOString()
  })
};

export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

export function sanitizeHTMLToDom(html: string): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  div.innerHTML = html;
  while (div.firstChild) {
    fragment.appendChild(div.firstChild);
  }
  return fragment;
}
