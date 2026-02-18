import type { ICustomTemplateService } from "./interfaces";
import type { Template } from "@repo/core";

const STORAGE_KEY = "mermaid-editor-custom-templates";

export class CustomTemplateService implements ICustomTemplateService {
  private templates: Template[] | null = null;

  private load(): Template[] {
    if (this.templates !== null) return this.templates;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.templates = raw ? JSON.parse(raw) : [];
    } catch {
      this.templates = [];
    }
    return this.templates!;
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.templates));
    } catch { /* storage full */ }
  }

  getTemplates(): Template[] {
    return this.load();
  }

  addTemplate(template: Template): void {
    this.load();
    this.templates!.push(template);
    this.save();
  }

  deleteTemplate(name: string): void {
    this.load();
    this.templates = this.templates!.filter(t => t.name !== name);
    this.save();
  }
}
