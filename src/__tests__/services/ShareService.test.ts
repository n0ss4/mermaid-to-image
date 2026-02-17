import { test, expect, describe } from "bun:test";
import { encodeShareUrl, decodeShareUrl } from "../../utils/sharing";

describe("sharing", () => {
  test("roundtrip encode/decode preserves code", () => {
    const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } =
      require("lz-string");

    const state = { code: "graph TD\n  A --> B", mermaidTheme: "dark" };
    const json = JSON.stringify(state);
    const compressed = compressToEncodedURIComponent(json);
    const decompressed = decompressFromEncodedURIComponent(compressed);
    const result = JSON.parse(decompressed);

    expect(result.code).toBe(state.code);
    expect(result.mermaidTheme).toBe(state.mermaidTheme);
  });

  test("decodeShareUrl returns null for URL without d param", () => {
    const result = decodeShareUrl("http://localhost:3000/");
    expect(result).toBeNull();
  });

  test("decodeShareUrl returns null for malformed data", () => {
    const result = decodeShareUrl("http://localhost:3000/?d=garbage!!!");
    expect(result).toBeNull();
  });

  test("decodeShareUrl returns null for invalid JSON structure", () => {
    const { compressToEncodedURIComponent } = require("lz-string");
    const compressed = compressToEncodedURIComponent(
      JSON.stringify({ notCode: "hello" })
    );
    const result = decodeShareUrl(`http://localhost:3000/?d=${compressed}`);
    expect(result).toBeNull();
  });

  test("decodeShareUrl succeeds with valid compressed data", () => {
    const { compressToEncodedURIComponent } = require("lz-string");
    const state = { code: "pie title Test\n  \"A\" : 50\n  \"B\" : 50" };
    const compressed = compressToEncodedURIComponent(JSON.stringify(state));
    const result = decodeShareUrl(`http://localhost:3000/?d=${compressed}`);
    expect(result).not.toBeNull();
    expect(result!.code).toBe(state.code);
  });
});
