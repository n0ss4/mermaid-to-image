import { test, expect, describe } from "bun:test";
import type { Command } from "../../index";

describe("Command model", () => {
  test("command interface has required fields", () => {
    let called = false;
    const cmd: Command = {
      id: "test-cmd",
      label: "Test Command",
      category: "Test",
      action: () => { called = true; },
    };
    expect(cmd.id).toBe("test-cmd");
    expect(cmd.label).toBe("Test Command");
    expect(cmd.category).toBe("Test");
    expect(cmd.shortcut).toBeUndefined();
    cmd.action();
    expect(called).toBe(true);
  });

  test("command with shortcut", () => {
    const cmd: Command = {
      id: "shortcut-cmd",
      label: "With Shortcut",
      category: "Test",
      shortcut: ["Ctrl", "P"],
      action: () => {},
    };
    expect(cmd.shortcut).toEqual(["Ctrl", "P"]);
  });

  test("commands can be filtered by label", () => {
    const commands: Command[] = [
      { id: "a", label: "New Tab", category: "Tabs", action: () => {} },
      { id: "b", label: "Close Tab", category: "Tabs", action: () => {} },
      { id: "c", label: "Export PNG", category: "Export", action: () => {} },
    ];
    const query = "tab";
    const filtered = commands.filter(c => c.label.toLowerCase().includes(query));
    expect(filtered).toHaveLength(2);
    expect(filtered[0]!.id).toBe("a");
    expect(filtered[1]!.id).toBe("b");
  });

  test("commands can be filtered by category", () => {
    const commands: Command[] = [
      { id: "a", label: "New Tab", category: "Tabs", action: () => {} },
      { id: "b", label: "Export PNG", category: "Export", action: () => {} },
      { id: "c", label: "Export PDF", category: "Export", action: () => {} },
    ];
    const query = "export";
    const filtered = commands.filter(c =>
      c.label.toLowerCase().includes(query) || c.category.toLowerCase().includes(query)
    );
    expect(filtered).toHaveLength(2);
  });
});
