import { RotateCcw, Trash2 } from "lucide-react";
import type { HistoryViewModelValue } from "../viewmodels/HistoryViewModel";

interface HistoryPanelProps {
  readonly vm: HistoryViewModelValue;
  readonly onClose: () => void;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function HistoryPanel({ vm, onClose }: HistoryPanelProps) {
  const reversed = [...vm.snapshots].reverse();

  return (
    <div className="template-overlay" onClick={onClose}>
      <div className="history-modal" onClick={e => e.stopPropagation()}>
        <div className="template-header">
          <h2>Version History</h2>
          <div style={{ display: "flex", gap: 4 }}>
            {vm.snapshots.length > 0 && (
              <button className="btn-icon" onClick={vm.clearHistory} title="Clear history">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="history-list">
          {reversed.length === 0 && (
            <p className="history-empty">No snapshots yet. History saves automatically every 30 seconds.</p>
          )}
          {reversed.map((snap, i) => (
            <button
              key={snap.timestamp}
              className="history-item"
              onClick={() => { vm.revert(snap); onClose(); }}
            >
              <div className="history-item-header">
                <RotateCcw size={12} />
                <span className="history-item-time">{timeAgo(snap.timestamp)}</span>
              </div>
              <code className="history-item-preview">
                {snap.code.slice(0, 80)}{snap.code.length > 80 ? "..." : ""}
              </code>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
