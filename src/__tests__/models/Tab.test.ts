import { test, expect, describe, beforeEach } from "bun:test";
import { tabReducer, createTab } from "../../models";
import type { Tab } from "../../models";

function makeState(tabs: Tab[], activeTabId?: string) {
  return { tabs, activeTabId: activeTabId ?? tabs[0]?.id ?? "" };
}

describe("tabReducer", () => {
  let tab1: Tab;
  let tab2: Tab;

  beforeEach(() => {
    tab1 = createTab({ name: "Tab 1", code: "graph TD\n  A --> B" });
    tab2 = createTab({ name: "Tab 2", code: "pie title Test" });
  });

  test("ADD_TAB adds a new tab and sets it active", () => {
    const state = makeState([tab1], tab1.id);
    const next = tabReducer(state, { type: "ADD_TAB" });
    expect(next.tabs).toHaveLength(2);
    expect(next.activeTabId).toBe(next.tabs[1]!.id);
  });

  test("ADD_TAB respects max 20 tabs", () => {
    const tabs = Array.from({ length: 20 }, (_, i) =>
      createTab({ name: `Tab ${i}` })
    );
    const state = makeState(tabs, tabs[0]!.id);
    const next = tabReducer(state, { type: "ADD_TAB" });
    expect(next.tabs).toHaveLength(20);
  });

  test("ADD_TAB with partial tab data", () => {
    const state = makeState([tab1], tab1.id);
    const next = tabReducer(state, {
      type: "ADD_TAB",
      tab: { name: "Custom", code: "sequenceDiagram" },
    });
    expect(next.tabs[1]!.name).toBe("Custom");
    expect(next.tabs[1]!.code).toBe("sequenceDiagram");
  });

  test("CLOSE_TAB removes tab", () => {
    const state = makeState([tab1, tab2], tab1.id);
    const next = tabReducer(state, { type: "CLOSE_TAB", id: tab1.id });
    expect(next.tabs).toHaveLength(1);
    expect(next.tabs[0]!.id).toBe(tab2.id);
  });

  test("CLOSE_TAB moves active to next tab", () => {
    const state = makeState([tab1, tab2], tab1.id);
    const next = tabReducer(state, { type: "CLOSE_TAB", id: tab1.id });
    expect(next.activeTabId).toBe(tab2.id);
  });

  test("CLOSE_TAB on non-active tab keeps active", () => {
    const state = makeState([tab1, tab2], tab1.id);
    const next = tabReducer(state, { type: "CLOSE_TAB", id: tab2.id });
    expect(next.activeTabId).toBe(tab1.id);
  });

  test("closing last tab creates fresh one", () => {
    const state = makeState([tab1], tab1.id);
    const next = tabReducer(state, { type: "CLOSE_TAB", id: tab1.id });
    expect(next.tabs).toHaveLength(1);
    expect(next.tabs[0]!.id).not.toBe(tab1.id);
    expect(next.activeTabId).toBe(next.tabs[0]!.id);
  });

  test("SET_ACTIVE changes active tab", () => {
    const state = makeState([tab1, tab2], tab1.id);
    const next = tabReducer(state, { type: "SET_ACTIVE", id: tab2.id });
    expect(next.activeTabId).toBe(tab2.id);
  });

  test("UPDATE_TAB updates tab properties", () => {
    const state = makeState([tab1], tab1.id);
    const next = tabReducer(state, {
      type: "UPDATE_TAB",
      id: tab1.id,
      changes: { code: "new code", exportScale: 2 },
    });
    expect(next.tabs[0]!.code).toBe("new code");
    expect(next.tabs[0]!.exportScale).toBe(2);
    expect(next.tabs[0]!.name).toBe("Tab 1");
  });

  test("RENAME_TAB renames a tab", () => {
    const state = makeState([tab1], tab1.id);
    const next = tabReducer(state, {
      type: "RENAME_TAB",
      id: tab1.id,
      name: "My Diagram",
    });
    expect(next.tabs[0]!.name).toBe("My Diagram");
  });
});

describe("createTab", () => {
  test("creates tab with defaults", () => {
    const tab = createTab();
    expect(tab.name).toBe("Untitled");
    expect(tab.code).toBe("");
    expect(tab.mermaidTheme).toBe("default");
    expect(tab.exportScale).toBe(4);
    expect(tab.id).toBeTruthy();
    expect(tab.createdAt).toBeGreaterThan(0);
  });

  test("creates tab with overrides", () => {
    const tab = createTab({ name: "Test", code: "graph TD" });
    expect(tab.name).toBe("Test");
    expect(tab.code).toBe("graph TD");
  });
});

describe("localStorage roundtrip", () => {
  test("state can be serialized and deserialized", () => {
    const tab = createTab({ name: "Test", code: "pie title X" });
    const state = { tabs: [tab], activeTabId: tab.id };
    const json = JSON.stringify(state);
    const parsed = JSON.parse(json);
    expect(parsed.tabs).toHaveLength(1);
    expect(parsed.tabs[0].name).toBe("Test");
    expect(parsed.tabs[0].code).toBe("pie title X");
    expect(parsed.activeTabId).toBe(tab.id);
  });
});
