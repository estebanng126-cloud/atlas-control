import { useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { WorkbenchAgentPanel } from "./WorkbenchAgentPanel";
import { WorkbenchEditorPanel } from "./WorkbenchEditorPanel";
import { WorkbenchExplorerPanel } from "./WorkbenchExplorerPanel";
import { WorkbenchInspectorPanel } from "./WorkbenchInspectorPanel";

const SPLITTER_WIDTH = 4;

const MINS: [number, number, number, number] = [120, 240, 100, 100];

const PANELS = [
  WorkbenchExplorerPanel,
  WorkbenchEditorPanel,
  WorkbenchInspectorPanel,
  WorkbenchAgentPanel,
] as const;

/** Arrastre en el splitter `splitterIndex` (0..2): delta>0 mueve el separador a la derecha. */
function applySplitterDelta(
  w: [number, number, number, number],
  mins: [number, number, number, number],
  splitterIndex: number,
  delta: number,
): [number, number, number, number] {
  if (delta === 0) return w;
  const out: [number, number, number, number] = [...w];
  const left = splitterIndex;

  if (delta > 0) {
    let need = delta;
    let i = left + 1;
    while (need > 0 && i < 4) {
      const available = out[i] - mins[i];
      if (available >= need) {
        out[i] -= need;
        out[left] += need;
        need = 0;
      } else {
        out[left] += available;
        out[i] = mins[i];
        need -= available;
        i++;
      }
    }
  } else {
    const need = -delta;
    let given = 0;
    let i = left;
    while (given < need && i >= 0) {
      const can = out[i] - mins[i];
      const take = Math.min(can, need - given);
      out[i] -= take;
      given += take;
      if (given < need) i--;
    }
    out[left + 1] += given;
  }

  return out;
}

function fitWidthsToTotal(
  w: [number, number, number, number],
  mins: [number, number, number, number],
  totalInner: number,
): [number, number, number, number] {
  const out: [number, number, number, number] = [...w];
  const sum = out[0] + out[1] + out[2] + out[3];
  let slack = totalInner - sum;
  if (slack === 0) return out;
  if (slack > 0) {
    out[3] += slack;
    return out;
  }
  let need = -slack;
  for (let i = 3; i >= 0 && need > 0; i--) {
    const can = out[i] - mins[i];
    const take = Math.min(can, need);
    out[i] -= take;
    need -= take;
  }
  return out;
}

export function WorkbenchPanelGroup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widths, setWidths] = useState<[number, number, number, number]>([
    260, 520, 300, 360,
  ]);
  const [activeSplitter, setActiveSplitter] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const sync = () => {
      const inner = el.clientWidth - 3 * SPLITTER_WIDTH;
      if (inner <= 0) return;
      setWidths((w) => fitWidthsToTotal(w, MINS, inner));
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onSplitterMouseDown =
    (splitterIndex: number) => (e: ReactMouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      let lastX = e.clientX;
      setActiveSplitter(splitterIndex);
      const onMove = (ev: MouseEvent) => {
        const d = ev.clientX - lastX;
        lastX = ev.clientX;
        if (d === 0) return;
        setWidths((prev) => applySplitterDelta(prev, MINS, splitterIndex, d));
      };
      const onUp = () => {
        setActiveSplitter(null);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    };

  return (
    <div ref={containerRef} className="workbench-panel-group">
      {PANELS.flatMap((Panel, i) => {
        const chunk: ReactNode[] = [
          <div
            key={`pane-${i}`}
            className="workbench-panel-group__pane"
            style={{
              width: widths[i],
              minWidth: MINS[i],
            }}
          >
            <Panel />
          </div>,
        ];
        if (i < 3) {
          chunk.push(
            <div
              key={`split-${i}`}
              className={`workbench-panel-group__splitter${activeSplitter === i ? " workbench-panel-group__splitter--active" : ""}`}
              style={{ width: SPLITTER_WIDTH, flexBasis: SPLITTER_WIDTH }}
              onMouseDown={onSplitterMouseDown(i)}
              role="separator"
              aria-orientation="vertical"
            />,
          );
        }
        return chunk;
      })}
    </div>
  );
}
