import { test, expect, describe, beforeEach } from "bun:test";
import { HistoryService } from "../../services/HistoryService";

// Mock localStorage for tests
const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const k in store) delete store[k]; },
};

Object.defineProperty(globalThis, "localStorage", { value: mockLocalStorage, writable: true });

describe("HistoryService", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  test("returns empty array for unknown tab", () => {
    const service = new HistoryService();
    expect(service.getSnapshots("unknown-tab")).toEqual([]);
  });

  test("adds and retrieves snapshots", () => {
    const service = new HistoryService();
    service.addSnapshot("tab-1", "flowchart TD\n  A --> B");
    const snaps = service.getSnapshots("tab-1");
    expect(snaps).toHaveLength(1);
    expect(snaps[0]!.code).toBe("flowchart TD\n  A --> B");
    expect(snaps[0]!.tabId).toBe("tab-1");
  });

  test("does not add duplicate of last snapshot", () => {
    const service = new HistoryService();
    service.addSnapshot("tab-1", "code1");
    service.addSnapshot("tab-1", "code1");
    expect(service.getSnapshots("tab-1")).toHaveLength(1);
  });

  test("adds different code as new snapshot", () => {
    const service = new HistoryService();
    service.addSnapshot("tab-1", "code1");
    service.addSnapshot("tab-1", "code2");
    expect(service.getSnapshots("tab-1")).toHaveLength(2);
  });

  test("clears history for a tab", () => {
    const service = new HistoryService();
    service.addSnapshot("tab-1", "code1");
    service.addSnapshot("tab-1", "code2");
    service.clearHistory("tab-1");
    expect(service.getSnapshots("tab-1")).toEqual([]);
  });

  test("keeps separate history per tab", () => {
    const service = new HistoryService();
    service.addSnapshot("tab-1", "code-a");
    service.addSnapshot("tab-2", "code-b");
    expect(service.getSnapshots("tab-1")).toHaveLength(1);
    expect(service.getSnapshots("tab-2")).toHaveLength(1);
    expect(service.getSnapshots("tab-1")[0]!.code).toBe("code-a");
    expect(service.getSnapshots("tab-2")[0]!.code).toBe("code-b");
  });

  test("limits snapshots to MAX_SNAPSHOTS_PER_TAB", () => {
    const service = new HistoryService();
    for (let i = 0; i < 60; i++) {
      service.addSnapshot("tab-1", `code-${i}`);
    }
    expect(service.getSnapshots("tab-1")).toHaveLength(50);
  });

  test("persists to localStorage", () => {
    const service1 = new HistoryService();
    service1.addSnapshot("tab-1", "persisted-code");

    const service2 = new HistoryService();
    const snaps = service2.getSnapshots("tab-1");
    expect(snaps).toHaveLength(1);
    expect(snaps[0]!.code).toBe("persisted-code");
  });
});
