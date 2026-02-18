const FIX_SUGGESTIONS: [RegExp, string][] = [
  [/unknown diagram type/i, "Tip: Check the diagram keyword (e.g., flowchart, sequenceDiagram, classDiagram)"],
  [/lexical error/i, "Tip: Check for unclosed quotes or brackets near the indicated position"],
  [/expecting\b.*?\bgot\s+'NEWLINE'/i, "Tip: The previous line may be incomplete — check for missing arrows or colons"],
  [/expecting\b.*?\bgot\s+'EOF'/i, "Tip: A block may be missing its 'end' keyword"],
  [/syntax error/i, "Tip: Check for typos in keywords or missing colons/arrows"],
  [/duplicate/i, "Tip: An element with this name already exists — use a unique identifier"],
  [/not a valid/i, "Tip: Check that the value matches the expected format for this diagram type"],
];

export function formatError(error: string): string {
  if (!error) return "";

  let msg = error;

  // Strip "Error: " prefix
  msg = msg.replace(/^Error:\s*/i, "");

  // Simplify "Parse error on line X: ..." noise
  const parseMatch = msg.match(/Parse error on line (\d+):/i);
  if (parseMatch) {
    msg = msg.replace(/Parse error on line \d+:\s*/i, "");
  }

  // Simplify "Expecting ..., got ..." to "Unexpected token 'X' on line Y"
  const expectingMatch = msg.match(/Expecting\s+.+?,\s*got\s+'([^']+)'/i);
  if (expectingMatch && parseMatch) {
    msg = `Unexpected token '${expectingMatch[1]}' on line ${parseMatch[1]}`;
  }

  // Capitalize first letter
  msg = msg.charAt(0).toUpperCase() + msg.slice(1);

  // Truncate to ~150 chars
  if (msg.length > 150) {
    msg = msg.slice(0, 147) + "...";
  }

  // Append fix suggestion if matched
  for (const [pattern, suggestion] of FIX_SUGGESTIONS) {
    if (pattern.test(error)) {
      msg += ` — ${suggestion}`;
      break;
    }
  }

  return msg;
}
