/**
 * Repo / file service — inspección mínima del workspace.
 * Ver docs/agent-runtime-plan.md
 */

import fs from "node:fs/promises";
import path from "node:path";

import type { RepoFile } from "../types/index.js";

/** Nombres de directorio que se omiten por completo (subárbol). */
const SKIP_DIR_NAMES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
]);

function isInsideWorkspaceRoot(rootResolved: string, candidateAbs: string): boolean {
  const rel = path.relative(rootResolved, candidateAbs);
  return rel === "" || (!rel.startsWith(`..${path.sep}`) && rel !== ".." && !path.isAbsolute(rel));
}

/** Convierte una ruta relativa al workspace a forma POSIX, sin `..` que escapen la raíz lógica. */
function normalizeRepoRelativePath(relativePath: string): string {
  const posix = relativePath.replace(/\\/g, "/");
  const parts = posix.split("/").filter((s) => s !== "" && s !== ".");
  const out: string[] = [];
  for (const part of parts) {
    if (part === "..") {
      if (out.length > 0) out.pop();
    } else {
      out.push(part);
    }
  }
  return out.join("/");
}

function resolveUnderWorkspaceRoot(workspaceRoot: string, relativePath: string): string {
  const rootResolved = path.resolve(workspaceRoot);
  const rel = normalizeRepoRelativePath(relativePath);
  const abs = rel === "" ? rootResolved : path.resolve(rootResolved, rel);
  if (!isInsideWorkspaceRoot(rootResolved, abs)) {
    throw new Error("Path escapes workspace root");
  }
  return abs;
}

function toWorkspaceRelativePath(rootResolved: string, absolutePath: string): string {
  return path.relative(rootResolved, absolutePath).split(path.sep).join("/");
}

/**
 * Lista archivos y directorios bajo `relativeDir` (POSIX relativo al workspace), recursivo.
 * Omite subárboles cuyo segmento final está en la lista de exclusión.
 */
export async function listRepoFiles(
  workspaceRoot: string,
  relativeDir: string = "",
): Promise<RepoFile[]> {
  const rootResolved = path.resolve(workspaceRoot);
  const relDir = normalizeRepoRelativePath(relativeDir);
  const startAbs = relDir === "" ? rootResolved : path.resolve(rootResolved, relDir);
  if (!isInsideWorkspaceRoot(rootResolved, startAbs)) {
    throw new Error("Path escapes workspace root");
  }

  const out: RepoFile[] = [];

  async function walk(dirAbs: string): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(dirAbs, { withFileTypes: true });
    } catch (e) {
      const code = (e as NodeJS.ErrnoException).code;
      if (code === "ENOENT" || code === "ENOTDIR") return;
      throw e;
    }

    for (const ent of entries) {
      if (SKIP_DIR_NAMES.has(ent.name)) continue;

      const childAbs = path.join(dirAbs, ent.name);
      const relPosix = toWorkspaceRelativePath(rootResolved, childAbs);

      if (ent.isDirectory()) {
        out.push({ path: relPosix, kind: "directory" });
        await walk(childAbs);
      } else if (ent.isFile()) {
        out.push({ path: relPosix, kind: "file" });
      }
    }
  }

  await walk(startAbs);
  out.sort((a, b) => a.path.localeCompare(b.path));
  return out;
}

/** Lee un archivo de texto UTF-8; la ruta es relativa al workspace (POSIX). */
export async function readRepoFile(workspaceRoot: string, relativePath: string): Promise<string> {
  const abs = resolveUnderWorkspaceRoot(workspaceRoot, relativePath);
  const stat = await fs.stat(abs);
  if (!stat.isFile()) {
    throw new Error(`Not a file: ${normalizeRepoRelativePath(relativePath)}`);
  }
  return fs.readFile(abs, "utf8");
}

/** Indica si existe archivo o directorio bajo el workspace. */
export async function repoPathExists(workspaceRoot: string, relativePath: string): Promise<boolean> {
  let abs: string;
  try {
    abs = resolveUnderWorkspaceRoot(workspaceRoot, relativePath);
  } catch {
    return false;
  }
  try {
    await fs.access(abs);
    return true;
  } catch {
    return false;
  }
}
