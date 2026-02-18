import type { IClipboardService } from "./interfaces";

export class ClipboardService implements IClipboardService {
  async writeText(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);
  }
}
