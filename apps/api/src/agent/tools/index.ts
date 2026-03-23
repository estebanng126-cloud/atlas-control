/**
 * Tool runner mínimo del agente (una tool por ahora). Ver docs/agent-runtime-plan.md
 */

import { readRepoFile as readRepoFileFromRepo } from "../repo/index.js";

/** Resultado estable de `runAgentTool`: éxito con `data` o fallo con `error`. */
export type AgentToolResult =
  | { toolName: string; ok: true; data: unknown }
  | { toolName: string; ok: false; error: string };

type ToolFn = (workspaceRoot: string, input: unknown) => Promise<{ data: unknown } | { error: string }>;

const registry = new Map<string, ToolFn>([
  [
    "read_repo_file",
    async (workspaceRoot, input) => {
      if (input === null || typeof input !== "object" || Array.isArray(input)) {
        return { error: "read_repo_file: input must be an object" };
      }
      const path = (input as Record<string, unknown>).path;
      if (typeof path !== "string" || path.trim() === "") {
        return { error: "read_repo_file: input.path must be a non-empty string" };
      }
      const rel = path.trim().replace(/\\/g, "/");
      try {
        const content = await readRepoFileFromRepo(workspaceRoot, rel);
        return { data: { path: rel, content } };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return { error: msg };
      }
    },
  ],
]);

/**
 * Ejecuta una tool registrada por nombre. `input` es específico de cada tool.
 * `read_repo_file`: `{ path: string }` relativo al workspace (POSIX).
 */
export async function runAgentTool(
  workspaceRoot: string,
  toolName: string,
  input: unknown,
): Promise<AgentToolResult> {
  const fn = registry.get(toolName);
  if (fn === undefined) {
    return { toolName, ok: false, error: `Unknown tool: ${toolName}` };
  }

  const out = await fn(workspaceRoot, input);
  if ("error" in out) {
    return { toolName, ok: false, error: out.error };
  }
  return { toolName, ok: true, data: out.data };
}
