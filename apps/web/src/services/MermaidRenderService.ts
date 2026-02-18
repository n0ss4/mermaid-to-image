import mermaid from "mermaid";
import type { IRenderService } from "./interfaces";
import type { MermaidTheme } from "@repo/core";
import { DEFAULT_MERMAID_CONFIG } from "../utils/constants";

export class MermaidRenderService implements IRenderService {
  private iconsRegistered = false;

  private async ensureIcons(): Promise<void> {
    if (this.iconsRegistered) return;
    this.iconsRegistered = true;
    try {
      const packs = await Promise.all([
        fetch("https://unpkg.com/@iconify-json/logos/icons.json").then(r => r.json()),
        fetch("https://unpkg.com/@iconify-json/simple-icons/icons.json").then(r => r.json()),
      ]);
      mermaid.registerIconPacks([
        { name: packs[0].prefix, icons: packs[0] },
        { name: packs[1].prefix, icons: packs[1] },
      ]);
    } catch {
      // Icons are optional — diagrams still render without them
    }
  }

  async render(code: string, theme: MermaidTheme): Promise<{ svg: string; error: string }> {
    if (!code.trim()) {
      return { svg: "", error: "" };
    }
    await this.ensureIcons();
    const id = `mermaid-${Date.now()}`;
    try {
      mermaid.initialize({ ...DEFAULT_MERMAID_CONFIG, theme });
      const { svg } = await mermaid.render(id, code.trim());
      return { svg, error: "" };
    } catch (e) {
      document.getElementById(`d${id}`)?.remove();
      const message = e instanceof Error ? e.message : "Invalid syntax";
      return { svg: "", error: message };
    }
  }
}
