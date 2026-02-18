import type { IShareService } from "./interfaces";
import { encodeShareState, decodeShareState, type ShareState } from "@repo/core";

export class ShareService implements IShareService {
  encodeAndApply(state: ShareState): string {
    const url = new URL(globalThis.location.href);
    url.search = "";
    url.searchParams.set("d", encodeShareState(state));
    const href = url.toString();
    globalThis.history.replaceState(null, "", href);
    return href;
  }

  decodeFromUrl(url: string): ShareState | null {
    try {
      const parsed = new URL(url);
      return decodeShareState(parsed.searchParams.get("d") ?? "");
    } catch {
      return null;
    }
  }

  clearUrlParams(): void {
    const url = new URL(globalThis.location.href);
    url.search = "";
    globalThis.history.replaceState(null, "", url.toString());
  }
}
