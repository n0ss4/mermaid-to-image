import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import type { ShareState } from "./share";

export function encodeShareState(state: ShareState): string {
  return compressToEncodedURIComponent(JSON.stringify(state));
}

export function decodeShareState(encoded: string): ShareState | null {
  if (!encoded) return null;
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const state = JSON.parse(json) as ShareState;
    if (!state || typeof state.code !== "string") return null;
    return state;
  } catch {
    return null;
  }
}
