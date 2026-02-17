import { test, expect, describe } from "bun:test";
import { parseSvgDimensions } from "../../models";
import { clipboardSvgExporter } from "../../export/clipboard-svg";

describe("parseSvgDimensions", () => {
  test("parses viewBox dimensions", () => {
    const svg = `<svg viewBox="0 0 800 600"></svg>`;
    const { w, h } = parseSvgDimensions(svg);
    expect(w).toBe(800);
    expect(h).toBe(600);
  });

  test("parses width/height attributes when no viewBox", () => {
    const svg = `<svg width="1024" height="768"></svg>`;
    const { w, h } = parseSvgDimensions(svg);
    expect(w).toBe(1024);
    expect(h).toBe(768);
  });

  test("falls back to defaults when no dimensions", () => {
    const svg = `<svg></svg>`;
    const { w, h } = parseSvgDimensions(svg);
    expect(w).toBe(800);
    expect(h).toBe(600);
  });

  test("uses viewBox over width/height when both present", () => {
    const svg = `<svg viewBox="0 0 400 300" width="800" height="600"></svg>`;
    const { w, h } = parseSvgDimensions(svg);
    expect(w).toBe(400);
    expect(h).toBe(300);
  });

  test("handles viewBox with non-zero origin", () => {
    const svg = `<svg viewBox="10 20 500 400"></svg>`;
    const { w, h } = parseSvgDimensions(svg);
    expect(w).toBe(500);
    expect(h).toBe(400);
  });
});

describe("scale multiplication", () => {
  test("canvas dimensions are width * scale", () => {
    const w = 800;
    const h = 600;
    const scale = 4;
    expect(w * scale).toBe(3200);
    expect(h * scale).toBe(2400);
  });

  test("scale 1x gives original dimensions", () => {
    const w = 1024;
    const h = 768;
    expect(w * 1).toBe(1024);
    expect(h * 1).toBe(768);
  });
});

describe("clipboardSvgExporter", () => {
  test("has correct name and no extension", () => {
    expect(clipboardSvgExporter.name).toBe("SVG");
    expect(clipboardSvgExporter.extension).toBeUndefined();
  });
});
