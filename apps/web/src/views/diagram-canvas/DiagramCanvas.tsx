import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import type { DiagramDocument } from "@repo/core";
import type { ComposerSelection } from "../../viewmodels";

interface DiagramCanvasProps {
  readonly document: DiagramDocument;
  readonly selection: ComposerSelection;
  readonly onSelect: (selection: ComposerSelection) => void;
  readonly onNodeMove: (id: string, x: number, y: number) => void;
  readonly onConnectNodes: (sourceId: string, targetId: string) => void;
  readonly onUpdateNodeLabel: (id: string, label: string) => void;
  readonly onCreateNodeAt: (x: number, y: number) => string;
}

interface DragState {
  nodeId: string;
  offsetX: number;
  offsetY: number;
}

const MIN_VIEWPORT_WIDTH = 800;
const MIN_VIEWPORT_HEIGHT = 520;
const VIEWPORT_PADDING = 140;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 2.5;

function clampZoom(value: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
}

export function DiagramCanvas({
  document,
  selection,
  onSelect,
  onNodeMove,
  onConnectNodes,
  onUpdateNodeLabel,
  onCreateNodeAt,
}: DiagramCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [zoom, setZoom] = useState(1);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const nodeById = useMemo(() => new Map(document.nodes.map((n) => [n.id, n])), [document.nodes]);
  const viewBox = useMemo(() => {
    if (document.nodes.length === 0) {
      return { minX: 0, minY: 0, width: MIN_VIEWPORT_WIDTH, height: MIN_VIEWPORT_HEIGHT };
    }

    const minNodeX = Math.min(...document.nodes.map((n) => n.x));
    const minNodeY = Math.min(...document.nodes.map((n) => n.y));
    const maxNodeX = Math.max(...document.nodes.map((n) => n.x + n.width));
    const maxNodeY = Math.max(...document.nodes.map((n) => n.y + n.height));

    const minX = minNodeX - VIEWPORT_PADDING;
    const minY = minNodeY - VIEWPORT_PADDING;
    const width = Math.max(MIN_VIEWPORT_WIDTH, maxNodeX - minNodeX + VIEWPORT_PADDING * 2);
    const height = Math.max(MIN_VIEWPORT_HEIGHT, maxNodeY - minNodeY + VIEWPORT_PADDING * 2);

    return { minX, minY, width, height };
  }, [document.nodes]);

  const renderedViewBox = useMemo(() => {
    const cx = viewBox.minX + viewBox.width / 2;
    const cy = viewBox.minY + viewBox.height / 2;
    const w = viewBox.width / zoom;
    const h = viewBox.height / zoom;
    return {
      minX: cx - w / 2,
      minY: cy - h / 2,
      width: w,
      height: h,
    };
  }, [viewBox, zoom]);

  const clientToCanvas = (clientX: number, clientY: number): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: clientX, y: clientY };
    const rect = svg.getBoundingClientRect();
    const xRatio = (clientX - rect.left) / rect.width;
    const yRatio = (clientY - rect.top) / rect.height;
    return {
      x: renderedViewBox.minX + xRatio * renderedViewBox.width,
      y: renderedViewBox.minY + yRatio * renderedViewBox.height,
    };
  };

  const toCanvas = (e: PointerEvent): { x: number; y: number } => {
    return clientToCanvas(e.clientX, e.clientY);
  };

  const onNodePointerDown = (e: PointerEvent<SVGGElement>, nodeId: string) => {
    e.stopPropagation();
    const point = toCanvas(e);
    const node = nodeById.get(nodeId);
    if (!node) return;

    if (e.shiftKey && selection?.kind === "node" && selection.id !== nodeId) {
      onConnectNodes(selection.id, nodeId);
      return;
    }

    onSelect({ kind: "node", id: nodeId });
    setDragState({
      nodeId,
      offsetX: point.x - node.x,
      offsetY: point.y - node.y,
    });
    (e.currentTarget as SVGGElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!dragState) return;
    const point = toCanvas(e);
    onNodeMove(dragState.nodeId, point.x - dragState.offsetX, point.y - dragState.offsetY);
  };

  const onPointerUp = () => {
    setDragState(null);
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => clampZoom(z * (e.deltaY < 0 ? 1.08 : 0.92)));
    };

    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    if (!editingNodeId) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editingNodeId]);

  const commitInlineEdit = () => {
    if (!editingNodeId) return;
    onUpdateNodeLabel(editingNodeId, editingDraft);
    setEditingNodeId(null);
  };

  return (
    <div className="diagram-canvas-wrap">
      <div className="diagram-canvas-toolbar">
        <button className="btn-icon" type="button" onClick={() => setZoom((z) => clampZoom(z - 0.1))} title="Zoom out">
          -
        </button>
        <span className="diagram-canvas-zoom-label">{Math.round(zoom * 100)}%</span>
        <button className="btn-icon" type="button" onClick={() => setZoom((z) => clampZoom(z + 0.1))} title="Zoom in">
          +
        </button>
        <button className="btn-secondary btn-sm" type="button" onClick={() => setZoom(1)} title="Reset zoom">
          100%
        </button>
      </div>
      <svg
        ref={svgRef}
        className="diagram-canvas"
        viewBox={`${renderedViewBox.minX} ${renderedViewBox.minY} ${renderedViewBox.width} ${renderedViewBox.height}`}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) onSelect(null);
        }}
        onDoubleClick={(e) => {
          if (e.target !== e.currentTarget) return;
          const point = clientToCanvas(e.clientX, e.clientY);
          const id = onCreateNodeAt(point.x - 80, point.y - 36);
          setEditingNodeId(id);
          setEditingDraft(id);
        }}
      >
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
            <polygon points="0 0, 8 3.5, 0 7" fill="currentColor" />
          </marker>
        </defs>

        {document.edges.map((edge) => {
          const source = nodeById.get(edge.source);
          const target = nodeById.get(edge.target);
          if (!source || !target) return null;

          const x1 = source.x + source.width / 2;
          const y1 = source.y + source.height / 2;
          const x2 = target.x + target.width / 2;
          const y2 = target.y + target.height / 2;
          const isSelected = selection?.kind === "edge" && selection.id === edge.id;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;

          return (
            <g key={edge.id} className="diagram-edge" onClick={(e) => { e.stopPropagation(); onSelect({ kind: "edge", id: edge.id }); }}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                markerEnd="url(#arrow)"
                strokeDasharray={edge.style === "dotted" ? "6 4" : undefined}
                strokeWidth={edge.style === "thick" ? 3 : 2}
                className={isSelected ? "edge-selected" : ""}
              />
              {edge.label && (
                <text x={mx} y={my - 6} textAnchor="middle" className="edge-label">
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {document.nodes.map((node) => {
          const isSelected = selection?.kind === "node" && selection.id === node.id;
          return (
            <g
              key={node.id}
              className={`diagram-node${isSelected ? " node-selected" : ""}`}
              transform={`translate(${node.x}, ${node.y})`}
              onPointerDown={(e) => onNodePointerDown(e, node.id)}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onSelect({ kind: "node", id: node.id });
                setEditingNodeId(node.id);
                setEditingDraft(node.label);
              }}
            >
              {node.shape === "round" ? (
                <rect rx="20" ry="20" width={node.width} height={node.height} />
              ) : node.shape === "diamond" ? (
                <polygon points={`${node.width / 2},0 ${node.width},${node.height / 2} ${node.width / 2},${node.height} 0,${node.height / 2}`} />
              ) : (
                <rect rx="8" ry="8" width={node.width} height={node.height} />
              )}
              {editingNodeId === node.id ? (
                <foreignObject x={8} y={node.height / 2 - 14} width={node.width - 16} height={30}>
                  <input
                    ref={inputRef}
                    className="diagram-node-inline-input"
                    value={editingDraft}
                    onChange={(e) => setEditingDraft(e.target.value)}
                    onBlur={commitInlineEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        commitInlineEdit();
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingNodeId(null);
                      }
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                </foreignObject>
              ) : (
                <text x={node.width / 2} y={node.height / 2 + 4} textAnchor="middle">
                  {node.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <p className="diagram-canvas-hint">Double-click background: new node. Double-click node: edit. Shift + click another node: connect.</p>
    </div>
  );
}
