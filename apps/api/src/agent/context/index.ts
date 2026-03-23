/**
 * Context engine mínimo — elige un paquete pequeño de archivos para una tarea.
 * Ver docs/agent-runtime-plan.md
 */

import { readRepoFile } from "../repo/index.js";
import { searchRepoPaths, searchRepoText } from "../search/index.js";
import type { ContextBundle } from "../types/index.js";

const MAX_FILES = 6;
const MAX_CHARS_PER_FILE = 4000;
const MAX_TERMS = 8;
const TRUNCATION_NOTE = "\n…[truncado]";

/** Términos alfanuméricos simples del prompt (sin ranking ni NLP). */
function extractTerms(taskPrompt: string): string[] {
  const raw = taskPrompt.toLowerCase().match(/[a-z0-9][a-z0-9_.-]{1,}/g) ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of raw) {
    if (w.length < 2) continue;
    if (seen.has(w)) continue;
    seen.add(w);
    out.push(w);
    if (out.length >= MAX_TERMS) break;
  }
  return out;
}

function isDirectoryPathHit(preview: string, path: string): boolean {
  return preview === `${path}/`;
}

function truncateContent(content: string): string {
  if (content.length <= MAX_CHARS_PER_FILE) return content;
  const head = content.slice(0, MAX_CHARS_PER_FILE - TRUNCATION_NOTE.length);
  return `${head}${TRUNCATION_NOTE}`;
}

/**
 * Construye un `ContextBundle` a partir del prompt: búsqueda por path y por texto, deduplicado y acotado.
 *
 * Prioridad simple: +2 por coincidencia de fragmento en ruta (solo archivos), +1 por archivo con
 * coincidencia de texto (una vez por término y archivo).
 */
export async function buildContextBundle(
  workspaceRoot: string,
  taskPrompt: string,
): Promise<ContextBundle> {
  let terms = extractTerms(taskPrompt);
  if (terms.length === 0) {
    const t = taskPrompt.trim();
    if (t.length >= 2) {
      terms = [t.slice(0, 64).toLowerCase()];
    }
  }

  if (terms.length === 0) {
    return {
      files: [],
      rationale: "No hubo términos extraíbles del prompt; no se armó contexto.",
    };
  }

  const scores = new Map<string, number>();

  for (const term of terms) {
    const pathHits = await searchRepoPaths(workspaceRoot, term);
    for (const h of pathHits) {
      if (isDirectoryPathHit(h.preview, h.path)) continue;
      scores.set(h.path, (scores.get(h.path) ?? 0) + 2);
    }

    const textHits = await searchRepoText(workspaceRoot, term);
    const seenFiles = new Set<string>();
    for (const h of textHits) {
      if (seenFiles.has(h.path)) continue;
      seenFiles.add(h.path);
      scores.set(h.path, (scores.get(h.path) ?? 0) + 1);
    }
  }

  if (scores.size === 0) {
    return {
      files: [],
      rationale: `Sin coincidencias en ruta o texto para: ${terms.join(", ")}.`,
    };
  }

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const picked = ranked.slice(0, MAX_FILES).map(([p]) => p);

  const files: { path: string; content: string }[] = [];
  for (const path of picked) {
    try {
      const content = truncateContent(await readRepoFile(workspaceRoot, path));
      files.push({ path, content });
    } catch {
      continue;
    }
  }

  const rationale =
    files.length === 0
      ? `Se buscó con términos: ${terms.join(", ")}; no se pudieron leer archivos candidatos.`
      : `Hasta ${MAX_FILES} archivos, priorizados por coincidencia en ruta (+2) y en contenido (+1) para: ${terms.join(", ")}. Máx. ${MAX_CHARS_PER_FILE} caracteres por archivo.`;

  return { files, rationale };
}
