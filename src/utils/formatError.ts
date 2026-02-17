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

  return msg;
}
