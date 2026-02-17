import mermaid from "mermaid";
import type { IRenderService } from "./interfaces";
import type { MermaidTheme } from "../models";
import { DEFAULT_MERMAID_CONFIG } from "../utils/constants";

export class MermaidRenderService implements IRenderService {
  async render(code: string, theme: MermaidTheme): Promise<{ svg: string; error: string }> {
    if (!code.trim()) {
      return { svg: "", error: "" };
    }
    try {
      mermaid.initialize({ ...DEFAULT_MERMAID_CONFIG, theme });
      const id = `mermaid-${Date.now()}`;
      const { svg } = await mermaid.render(id, code.trim());
      return { svg, error: "" };
    } catch (e: any) {
      return { svg: "", error: e?.message || "Invalid syntax" };
    }
  }
}
