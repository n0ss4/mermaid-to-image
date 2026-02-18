export function parseSvgDimensions(svgHtml: string): { w: number; h: number } {
  const viewBoxMatch = /viewBox=["']([^"']+)["']/.exec(svgHtml);
  if (viewBoxMatch?.[1]) {
    const parts = viewBoxMatch[1].split(/[\s,]+/).map(Number);
    return { w: parts[2] ?? 800, h: parts[3] ?? 600 };
  }

  const widthMatch = /\bwidth=["']([^"']+)["']/.exec(svgHtml);
  const heightMatch = /\bheight=["']([^"']+)["']/.exec(svgHtml);
  return {
    w: widthMatch?.[1] ? Number.parseFloat(widthMatch[1]) : 800,
    h: heightMatch?.[1] ? Number.parseFloat(heightMatch[1]) : 600,
  };
}
