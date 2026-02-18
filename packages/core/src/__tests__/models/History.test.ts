import { test, expect, describe } from "bun:test";
import type { DiagramSnapshot } from "../../index";
import { MAX_SNAPSHOTS_PER_TAB } from "../../index";

describe("History model", () => {
  test("DiagramSnapshot has required fields", () => {
    const snap: DiagramSnapshot = {
      code: "flowchart TD\n  A --> B",
      timestamp: Date.now(),
      tabId: "tab-1",
    };
    expect(snap.code).toBe("flowchart TD\n  A --> B");
    expect(snap.tabId).toBe("tab-1");
    expect(typeof snap.timestamp).toBe("number");
  });

  test("MAX_SNAPSHOTS_PER_TAB is 50", () => {
    expect(MAX_SNAPSHOTS_PER_TAB).toBe(50);
  });
});
