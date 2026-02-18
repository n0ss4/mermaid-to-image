import { useState, useRef, useEffect } from "react";
import { ChevronDown, Download, Clipboard, Package } from "lucide-react";
import type { Exporter } from "@repo/core";
import type { ExportViewModelValue } from "../viewmodels";
import { useToast } from "../viewmodels/providers/ToastProvider";

interface ExportDropdownProps {
  readonly vm: ExportViewModelValue;
  readonly transparentBg?: boolean;
  readonly onToggleTransparent?: () => void;
  readonly onBatchExport?: () => void;
}

export function ExportDropdown({ vm, transparentBg, onToggleTransparent, onBatchExport }: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const handleExport = (exporter: Exporter) => {
    vm.runExport(exporter);
    setOpen(false);
    if (exporter.extension) {
      showToast("Downloaded!");
    } else {
      showToast("Copied to clipboard!");
    }
  };

  const downloadExporters = vm.exporters.filter((e) => e.extension);
  const clipboardExporters = vm.exporters.filter((e) => !e.extension);

  return (
    <div className="export-dropdown" ref={ref}>
      <button
        className="btn-secondary btn-sm"
        onClick={() => setOpen(!open)}
        disabled={!vm.canExport}
      >
        <Download size={14} /> Export <ChevronDown size={12} />
      </button>
      {open && (
        <div className="export-dropdown-menu">
          {onToggleTransparent && (
            <>
              <div className="export-dropdown-row">
                <label>Transparent BG</label>
                <input
                  type="checkbox"
                  checked={transparentBg ?? false}
                  onChange={onToggleTransparent}
                />
              </div>
              <div className="export-dropdown-divider" />
            </>
          )}
          {downloadExporters.map((exp) => (
            <button
              key={`dl-${exp.name}`}
              className="export-dropdown-item"
              onClick={() => handleExport(exp)}
            >
              <Download size={13} /> Download {exp.name}
            </button>
          ))}
          <div className="export-dropdown-divider" />
          {clipboardExporters.map((exp) => (
            <button
              key={`cp-${exp.name}`}
              className="export-dropdown-item"
              onClick={() => handleExport(exp)}
            >
              <Clipboard size={13} /> Copy {exp.name}
            </button>
          ))}
          {onBatchExport && (
            <>
              <div className="export-dropdown-divider" />
              <button
                className="export-dropdown-item"
                onClick={() => {
                  onBatchExport();
                  setOpen(false);
                  showToast("Exporting all tabs...");
                }}
              >
                <Package size={13} /> Export All (ZIP)
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
