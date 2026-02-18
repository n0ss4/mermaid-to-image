import { beforeEach, describe, expect, test } from "bun:test";
import { StorageService } from "../../services/StorageService";
import { createTab, type TabState } from "@repo/core";

const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    for (const key of Object.keys(store)) delete store[key];
  },
};

describe("StorageService", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    (globalThis as unknown as { localStorage: typeof mockLocalStorage }).localStorage = mockLocalStorage;
    (globalThis as unknown as { matchMedia: (query: string) => { matches: boolean } }).matchMedia = () => ({ matches: false });
  });

  test("saveTabState does not persist docCache", () => {
    const service = new StorageService();
    const tab = createTab({ code: "flowchart TD\n  A --> B", docCache: {
      version: "1",
      kind: "flowchart",
      direction: "TD",
      nodes: [],
      edges: [],
      subgraphs: [],
      rawBlocks: [],
    } });
    const state: TabState = { tabs: [tab], activeTabId: tab.id };

    service.saveTabState(state);

    const saved = JSON.parse(store["mermaid-editor-tabs"]!);
    expect(saved.tabs[0].docCache).toBeUndefined();
  });

  test("saveTabState does not throw on localStorage failures", () => {
    (globalThis as unknown as { localStorage: typeof mockLocalStorage }).localStorage = {
      ...mockLocalStorage,
      setItem: () => {
        throw new Error("quota exceeded");
      },
    };

    const service = new StorageService();
    const tab = createTab();

    expect(() =>
      service.saveTabState({ tabs: [tab], activeTabId: tab.id })
    ).not.toThrow();
  });
});
