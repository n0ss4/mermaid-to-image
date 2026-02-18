import { describe, expect, test } from "bun:test";
import { parseErrorLine } from "../../domain/errorLine";
import { formatError } from "../../domain/errorFormat";

describe("error utilities", () => {
  test("parseErrorLine extracts line", () => {
    expect(parseErrorLine("Parse error on line 8: blah")).toBe(8);
  });

  test("formatError strips prefix and keeps readable", () => {
    expect(formatError("Error: unknown diagram type")).toContain("Unknown diagram type");
  });
});
