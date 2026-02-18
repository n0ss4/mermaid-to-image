import { test, expect, describe, beforeEach } from "bun:test";
import { CustomTemplateService } from "../../services/CustomTemplateService";

const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const k in store) delete store[k]; },
};

Object.defineProperty(globalThis, "localStorage", { value: mockLocalStorage, writable: true });

describe("CustomTemplateService", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  test("returns empty array initially", () => {
    const service = new CustomTemplateService();
    expect(service.getTemplates()).toEqual([]);
  });

  test("adds a template", () => {
    const service = new CustomTemplateService();
    service.addTemplate({ name: "My Flow", category: "My Templates", code: "flowchart TD\n  A --> B" });
    const templates = service.getTemplates();
    expect(templates).toHaveLength(1);
    expect(templates[0]!.name).toBe("My Flow");
    expect(templates[0]!.category).toBe("My Templates");
  });

  test("deletes a template by name", () => {
    const service = new CustomTemplateService();
    service.addTemplate({ name: "T1", category: "My Templates", code: "code1" });
    service.addTemplate({ name: "T2", category: "My Templates", code: "code2" });
    service.deleteTemplate("T1");
    const templates = service.getTemplates();
    expect(templates).toHaveLength(1);
    expect(templates[0]!.name).toBe("T2");
  });

  test("persists to localStorage", () => {
    const service1 = new CustomTemplateService();
    service1.addTemplate({ name: "Persisted", category: "My Templates", code: "code" });

    const service2 = new CustomTemplateService();
    expect(service2.getTemplates()).toHaveLength(1);
    expect(service2.getTemplates()[0]!.name).toBe("Persisted");
  });

  test("handles multiple adds", () => {
    const service = new CustomTemplateService();
    service.addTemplate({ name: "A", category: "My Templates", code: "a" });
    service.addTemplate({ name: "B", category: "My Templates", code: "b" });
    service.addTemplate({ name: "C", category: "My Templates", code: "c" });
    expect(service.getTemplates()).toHaveLength(3);
  });
});
