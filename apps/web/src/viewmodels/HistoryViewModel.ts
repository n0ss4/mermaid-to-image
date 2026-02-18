import { useState, useEffect, useRef, useCallback } from "react";
import type { IHistoryService } from "../services";
import type { DiagramSnapshot } from "@repo/core";

export interface HistoryViewModelValue {
  snapshots: DiagramSnapshot[];
  revert: (snapshot: DiagramSnapshot) => void;
  clearHistory: () => void;
}

export function useHistoryViewModel(
  tabId: string,
  code: string,
  historyService: IHistoryService,
  onRevert: (code: string) => void,
): HistoryViewModelValue {
  const [snapshots, setSnapshots] = useState<DiagramSnapshot[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const lastCodeRef = useRef(code);

  // Load snapshots when tab changes
  useEffect(() => {
    setSnapshots(historyService.getSnapshots(tabId));
  }, [tabId, historyService]);

  // Auto-snapshot every 30s if code changed
  useEffect(() => {
    lastCodeRef.current = code;
  }, [code]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const currentCode = lastCodeRef.current;
      if (currentCode.trim()) {
        historyService.addSnapshot(tabId, currentCode);
        setSnapshots(historyService.getSnapshots(tabId));
      }
    }, 30000);
    return () => clearInterval(intervalRef.current);
  }, [tabId, historyService]);

  const revert = useCallback((snapshot: DiagramSnapshot) => {
    onRevert(snapshot.code);
  }, [onRevert]);

  const clearHistory = useCallback(() => {
    historyService.clearHistory(tabId);
    setSnapshots([]);
  }, [tabId, historyService]);

  return { snapshots, revert, clearHistory };
}
