import { useRef, useEffect } from "react";
import { LayoutGrid, Share2, Download, Clipboard, Keyboard } from "lucide-react";
import type { Exporter } from "../models";
import type { ExportViewModelValue } from "../viewmodels";

interface MobileMenuProps {
  readonly onShowTemplates: () => void;
  readonly onShare: () => void;
  readonly onShowShortcuts: () => void;
  readonly exportVM: ExportViewModelValue;
  readonly onExport: (exporter: Exporter) => void;
  readonly onClose: () => void;
}

export function MobileMenu({
  onShowTemplates,
  onShare,
  onShowShortcuts,
  exportVM,
  onExport,
  onClose,
}: MobileMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const downloadExporters = exportVM.exporters.filter((e) => e.extension);
  const clipboardExporters = exportVM.exporters.filter((e) => !e.extension);

  return (
    <div className="mobile-menu" ref={ref}>
      <button
        className="mobile-menu-item"
        onClick={() => { onShowTemplates(); onClose(); }}
      >
        <LayoutGrid size={14} /> Templates
      </button>
      <button
        className="mobile-menu-item"
        onClick={() => { onShare(); onClose(); }}
      >
        <Share2 size={14} /> Share
      </button>
      <div className="mobile-menu-divider" />
      {downloadExporters.map((exp) => (
        <button
          key={`dl-${exp.name}`}
          className="mobile-menu-item"
          onClick={() => { onExport(exp); onClose(); }}
          disabled={!exportVM.canExport}
        >
          <Download size={13} /> Download {exp.name}
        </button>
      ))}
      {clipboardExporters.map((exp) => (
        <button
          key={`cp-${exp.name}`}
          className="mobile-menu-item"
          onClick={() => { onExport(exp); onClose(); }}
          disabled={!exportVM.canExport}
        >
          <Clipboard size={13} /> Copy {exp.name}
        </button>
      ))}
      <div className="mobile-menu-divider" />
      <button
        className="mobile-menu-item"
        onClick={() => { onShowShortcuts(); onClose(); }}
      >
        <Keyboard size={14} /> Keyboard Shortcuts
      </button>
    </div>
  );
}
