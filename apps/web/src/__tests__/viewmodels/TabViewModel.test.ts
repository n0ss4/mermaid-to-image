import { test, expect, describe } from "bun:test";
import { tabReducer, createTab } from "@repo/core";
import type { Tab } from "@repo/core";

function makeState(tabs: Tab[], activeTabId?: string) {
  return { tabs, activeTabId: activeTabId ?? tabs[0]?.id ?? "" };
}

describe("TabViewModel (reducer logic)", () => {
  test("adding and switching tabs preserves state", () => {
    const tab1 = createTab({ name: "Tab 1", code: "flowchart TD" });
    let state = makeState([tab1], tab1.id);

    // Add a second tab
    state = tabReducer(state, { type: "ADD_TAB", tab: { name: "Tab 2", code: "pie" } });
    expect(state.tabs).toHaveLength(2);
    const tab2Id = state.activeTabId;

    // Switch back to tab 1
    state = tabReducer(state, { type: "SET_ACTIVE", id: tab1.id });
    expect(state.activeTabId).toBe(tab1.id);

    // Update tab 1's code
    state = tabReducer(state, {
      type: "UPDATE_TAB",
      id: tab1.id,
      changes: { code: "flowchart LR\n  A --> B" },
    });
    expect(state.tabs.find((t) => t.id === tab1.id)!.code).toBe("flowchart LR\n  A --> B");

    // Tab 2 is unchanged
    expect(state.tabs.find((t) => t.id === tab2Id)!.code).toBe("pie");
  });

  test("closing active tab selects adjacent", () => {
    const t1 = createTab({ name: "1" });
    const t2 = createTab({ name: "2" });
    const t3 = createTab({ name: "3" });
    let state = makeState([t1, t2, t3], t2.id);

    state = tabReducer(state, { type: "CLOSE_TAB", id: t2.id });
    expect(state.tabs).toHaveLength(2);
    // Active should be t3 (the one at the same index)
    expect(state.activeTabId).toBe(t3.id);
  });

  test("renaming a tab updates only the name", () => {
    const tab = createTab({ name: "Old", code: "gantt" });
    let state = makeState([tab], tab.id);

    state = tabReducer(state, { type: "RENAME_TAB", id: tab.id, name: "New Name" });
    expect(state.tabs[0]!.name).toBe("New Name");
    expect(state.tabs[0]!.code).toBe("gantt");
  });
});
