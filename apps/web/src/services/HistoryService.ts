import type { IHistoryService } from "./interfaces";
import type { DiagramSnapshot } from "@repo/core";
import { MAX_SNAPSHOTS_PER_TAB } from "@repo/core";

const STORAGE_KEY = "mermaid-editor-history";

export class HistoryService implements IHistoryService {
  private snapshots: Map<string, DiagramSnapshot[]> = new Map();
  private loaded = false;

  private load(): void {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as Record<string, DiagramSnapshot[]>;
        for (const [tabId, snaps] of Object.entries(data)) {
          this.snapshots.set(tabId, snaps);
        }
      }
    } catch { /* ignore corrupt data */ }
  }

  private save(): void {
    const obj: Record<string, DiagramSnapshot[]> = {};
    for (const [tabId, snaps] of this.snapshots) {
      obj[tabId] = snaps;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch { /* storage full */ }
  }

  getSnapshots(tabId: string): DiagramSnapshot[] {
    this.load();
    return this.snapshots.get(tabId) ?? [];
  }

  addSnapshot(tabId: string, code: string): void {
    this.load();
    const snaps = this.snapshots.get(tabId) ?? [];
    // Don't save duplicate of the most recent
    if (snaps.length > 0 && snaps[snaps.length - 1]!.code === code) return;
    snaps.push({ code, timestamp: Date.now(), tabId });
    if (snaps.length > MAX_SNAPSHOTS_PER_TAB) {
      snaps.splice(0, snaps.length - MAX_SNAPSHOTS_PER_TAB);
    }
    this.snapshots.set(tabId, snaps);
    this.save();
  }

  clearHistory(tabId: string): void {
    this.load();
    this.snapshots.delete(tabId);
    this.save();
  }
}
