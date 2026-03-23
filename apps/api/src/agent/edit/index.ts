/**
 * Edit engine mínimo — solo vista previa y diff unificado (sin escribir disco).
 * Ver docs/agent-runtime-plan.md
 */

import { readRepoFile } from "../repo/index.js";
import type { EditPreview } from "../types/index.js";

const CONTEXT_LINES = 3;

type DiffOp = { kind: "eq" | "add" | "del"; line: string };

type DiffRow = {
  mark: " " | "-" | "+";
  text: string;
  oldNum?: number;
  newNum?: number;
};

/** Diff línea a línea vía LCS (sin dependencias). */
function lineDiffOps(oldLines: string[], newLines: string[]): DiffOp[] {
  const m = oldLines.length;
  const n = newLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const ops: DiffOp[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      ops.push({ kind: "eq", line: oldLines[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ kind: "add", line: newLines[j - 1] });
      j--;
    } else if (i > 0) {
      ops.push({ kind: "del", line: oldLines[i - 1] });
      i--;
    }
  }
  ops.reverse();
  return ops;
}

function opsToRows(ops: DiffOp[]): DiffRow[] {
  let oi = 1;
  let ni = 1;
  const rows: DiffRow[] = [];
  for (const op of ops) {
    if (op.kind === "eq") {
      rows.push({ mark: " ", text: op.line, oldNum: oi, newNum: ni });
      oi++;
      ni++;
    } else if (op.kind === "del") {
      rows.push({ mark: "-", text: op.line, oldNum: oi });
      oi++;
    } else {
      rows.push({ mark: "+", text: op.line, newNum: ni });
      ni++;
    }
  }
  return rows;
}

function changedRowIndices(rows: DiffRow[]): number[] {
  const idx: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].mark !== " ") idx.push(i);
  }
  return idx;
}

/** Agrupa índices de líneas cambiadas en rangos [lo,hi] en `rows` con contexto. */
function hunkRanges(rows: DiffRow[], changed: number[]): [number, number][] {
  if (changed.length === 0) return [];
  const ranges: [number, number][] = [];
  let blockStart = changed[0];
  let blockEnd = changed[0];
  for (let k = 1; k < changed.length; k++) {
    const idx = changed[k];
    if (idx - blockEnd <= 2 * CONTEXT_LINES + 1) {
      blockEnd = idx;
    } else {
      ranges.push([blockStart, blockEnd]);
      blockStart = idx;
      blockEnd = idx;
    }
  }
  ranges.push([blockStart, blockEnd]);
  return ranges.map(([s, e]) => {
    const lo = Math.max(0, s - CONTEXT_LINES);
    const hi = Math.min(rows.length - 1, e + CONTEXT_LINES);
    return [lo, hi] as [number, number];
  });
}

function emitUnifiedHunk(rows: DiffRow[], lo: number, hi: number): string {
  const slice = rows.slice(lo, hi + 1);
  const oldRefs = slice.filter((r) => r.mark === " " || r.mark === "-");
  const newRefs = slice.filter((r) => r.mark === " " || r.mark === "+");
  const oldCount = oldRefs.length;
  const newCount = newRefs.length;

  let oldStart: number;
  if (oldCount === 0) {
    oldStart = 0;
  } else {
    oldStart = oldRefs[0].oldNum ?? 1;
  }

  let newStart: number;
  if (newCount === 0) {
    newStart = oldRefs[0]?.oldNum ?? 0;
  } else {
    newStart = newRefs[0].newNum ?? 1;
  }

  const body = slice.map((r) => `${r.mark}${r.text}`).join("\n");
  return `@@ -${oldStart},${oldCount} +${newStart},${newCount} @@\n${body}`;
}

/**
 * Genera diff unificado estilo unified diff (prefijos ` `, `-`, `+` y cabeceras `---` / `+++`).
 */
function buildUnifiedDiff(relativePath: string, oldContent: string, newContent: string): string {
  if (oldContent === newContent) {
    return `--- a/${relativePath}\n+++ b/${relativePath}\n`;
  }

  const oldLines = oldContent.split(/\r?\n/);
  const newLines = newContent.split(/\r?\n/);
  const ops = lineDiffOps(oldLines, newLines);
  const rows = opsToRows(ops);
  const changed = changedRowIndices(rows);

  const header = `--- a/${relativePath}\n+++ b/${relativePath}`;
  if (changed.length === 0) {
    return `${header}\n`;
  }

  const ranges = hunkRanges(rows, changed);
  const hunks = ranges.map(([lo, hi]) => emitUnifiedHunk(rows, lo, hi));
  return `${header}\n${hunks.join("\n")}`;
}

/**
 * Lee el archivo actual y construye un `EditPreview` con diff unificado respecto a `nextContent`.
 * No escribe disco. Si el archivo no existe o no es legible, propaga el error de `readRepoFile`.
 */
export async function createEditPreview(
  workspaceRoot: string,
  relativePath: string,
  nextContent: string,
): Promise<EditPreview> {
  const current = await readRepoFile(workspaceRoot, relativePath);
  const unifiedDiff = buildUnifiedDiff(relativePath, current, nextContent);
  return { path: relativePath, unifiedDiff };
}
