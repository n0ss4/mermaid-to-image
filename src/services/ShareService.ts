import type { IShareService } from "./interfaces";
import type { ShareState } from "../models";
import { encodeShareUrl, decodeShareUrl } from "../utils/sharing";

export class ShareService implements IShareService {
  encodeAndApply(state: ShareState): string {
    const url = encodeShareUrl(state);
    window.history.replaceState(null, "", url);
    return url;
  }

  decodeFromUrl(url: string): ShareState | null {
    return decodeShareUrl(url);
  }

  clearUrlParams(): void {
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState(null, "", url.toString());
  }
}
