/**
 * Búsqueda mínima sobre el workspace (path + texto).
 * Usa exclusiones vía `listRepoFiles` del repo. Ver docs/agent-runtime-plan.md
 */

import { listRepoFiles, readRepoFile } from "../repo/index.js";
import type { RepoSearchHit } from "../types/index.js";

const PREVIEW_MAX = 240;

/** Extensiones que se omiten en búsqueda de texto (binarios u opacos). */
const SKIP_TEXT_SEARCH_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".pdf",
  ".zip",
  ".gz",
  ".br",
  ".7z",
  ".wasm",
  ".mp4",
  ".webm",
  ".mp3",
  ".ogg",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".otf",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".bin",
  ".sqlite",
  ".db",
]);

function trimQuery(q: string): string {
  return q.trim();
}

function fileExtLower(filePath: string): string {
  const i = filePath.lastIndexOf(".");
  if (i <= 0 || i === filePath.length - 1) return "";
  return filePath.slice(i).toLowerCase();
}

function skipTextSearchForPath(filePath: string): boolean {
  return SKIP_TEXT_SEARCH_EXT.has(fileExtLower(filePath));
}

function shortenPreview(line: string): string {
  const t = line.trimEnd();
  if (t.length <= PREVIEW_MAX) return t;
  return `${t.slice(0, PREVIEW_MAX)}…`;
}

/**
 * Busca entradas cuyo path contiene el fragmento (archivos y directorios), case-insensitive.
 */
export async function searchRepoPaths(
  workspaceRoot: string,
  pathFragment: string,
): Promise<RepoSearchHit[]> {
  const q = trimQuery(pathFragment);
  if (q === "") return [];

  const qLower = q.toLowerCase();
  const entries = await listRepoFiles(workspaceRoot);
  const hits: RepoSearchHit[] = [];

  for (const e of entries) {
    if (!e.path.toLowerCase().includes(qLower)) continue;
    const preview =
      e.kind === "directory" ? `${e.path}/` : e.path;
    hits.push({ path: e.path, preview });
  }

  hits.sort((a, b) => a.path.localeCompare(b.path));
  return hits;
}

/**
 * Busca texto en archivos bajo el workspace (línea a línea), case-insensitive.
 * Respeta el mismo árbol que `listRepoFiles` (directorios excluidos allí).
 */
export async function searchRepoText(
  workspaceRoot: string,
  textQuery: string,
): Promise<RepoSearchHit[]> {
  const q = trimQuery(textQuery);
  if (q === "") return [];

  const qLower = q.toLowerCase();
  const entries = await listRepoFiles(workspaceRoot);
  const hits: RepoSearchHit[] = [];

  for (const e of entries) {
    if (e.kind !== "file") continue;
    if (skipTextSearchForPath(e.path)) continue;

    let content: string;
    try {
      content = await readRepoFile(workspaceRoot, e.path);
    } catch {
      continue;
    }

    if (content.includes("\0")) continue;

    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(qLower)) {
        hits.push({
          path: e.path,
          line: i + 1,
          preview: shortenPreview(lines[i]),
        });
      }
    }
  }

  hits.sort((a, b) => {
    const c = a.path.localeCompare(b.path);
    if (c !== 0) return c;
    return (a.line ?? 0) - (b.line ?? 0);
  });
  return hits;
}
