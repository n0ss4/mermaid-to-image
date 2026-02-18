import { test, expect, describe, beforeEach } from "bun:test";
import { ShareService } from "../../services/ShareService";
import { encodeShareState } from "@repo/core";

describe("sharing", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "location", {
      value: { href: "http://localhost:3000/" },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "history", {
      value: { replaceState: () => {} },
      writable: true,
      configurable: true,
    });
  });

  test("roundtrip encode/decode preserves code", () => {
    const service = new ShareService();
    const state = { code: "graph TD\n  A --> B", mermaidTheme: "dark" };
    const url = service.encodeAndApply(state);
    const decoded = service.decodeFromUrl(url);

    expect(decoded).toEqual(state);
  });

  test("decodeFromUrl returns null for URL without d param", () => {
    const service = new ShareService();
    const result = service.decodeFromUrl("http://localhost:3000/");
    expect(result).toBeNull();
  });

  test("decodeFromUrl returns null for malformed data", () => {
    const service = new ShareService();
    const result = service.decodeFromUrl("http://localhost:3000/?d=garbage!!!");
    expect(result).toBeNull();
  });

  test("decodeFromUrl returns null for invalid JSON structure", () => {
    const service = new ShareService();
    const encoded = encodeShareState({ code: "" });
    const bad = encoded.replace(/./g, "x");
    const result = service.decodeFromUrl(`http://localhost:3000/?d=${bad}`);
    expect(result).toBeNull();
  });

  test("decodeFromUrl succeeds with valid compressed data", () => {
    const service = new ShareService();
    const state = { code: "pie title Test\n  \"A\" : 50\n  \"B\" : 50" };
    const encoded = encodeShareState(state);
    const result = service.decodeFromUrl(`http://localhost:3000/?d=${encoded}`);
    expect(result).not.toBeNull();
    expect(result!.code).toBe(state.code);
  });
});
