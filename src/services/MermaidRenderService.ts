import mermaid from "mermaid";
import type { IRenderService } from "./interfaces";
import type { MermaidTheme } from "../models";
import { DEFAULT_MERMAID_CONFIG } from "../utils/constants";

export class MermaidRenderService implements IRenderService {
  async render(code: string, theme: MermaidTheme): Promise<{ svg: string; error: string }> {
    if (!code.trim()) {
      return { svg: "", error: "" };
    }
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
