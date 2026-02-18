import { describe, expect, test } from "bun:test";
import { decodeShareState, encodeShareState } from "../../domain/shareCodec";

describe("share codec", () => {
  test("encodes and decodes state", () => {
    const input = { code: "graph TD\n  A --> B", mermaidTheme: "dark" };
    const encoded = encodeShareState(input);
    const decoded = decodeShareState(encoded);

    expect(decoded).toEqual(input);
  });

  test("returns null for invalid payload", () => {
    expect(decodeShareState("nope")).toBeNull();
  });

  test("returns null when code is missing", () => {
    const encoded = encodeURIComponent(JSON.stringify({ nope: true }));
    expect(decodeShareState(encoded)).toBeNull();
  });
});
