const LINE_PATTERNS = [
  /line (\d+)/i,
  /at line (\d+)/i,
  /on line (\d+)/i,
  /\((\d+):\d+\)/,
  /Parse error on line (\d+)/i,
  /Error: .*?line (\d+)/i,
];

export function parseErrorLine(error: string): number | null {
  if (!error) return null;
  for (const pattern of LINE_PATTERNS) {
    const match = pattern.exec(error);
    if (match) {
      const line = Number.parseInt(match[1]!, 10);
      if (line > 0) return line;
    }
  }
  return null;
}
