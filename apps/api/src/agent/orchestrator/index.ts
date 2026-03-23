/**
 * Orquestador mínimo — una pasada: tarea → contexto → resultado.
 * Ver docs/agent-runtime-plan.md
 */

import { buildContextBundle } from "../context/index.js";
import { createEditPreview } from "../edit/index.js";
import {
  createSessionState,
  getSessionState,
  setSessionState,
} from "../session/index.js";
import { runAgentTool } from "../tools/index.js";
import type {
  AgentSessionState,
  AgentTask,
  OrchestratorEditPreviewPassResult,
  OrchestratorResult,
  OrchestratorToolPassResult,
} from "../types/index.js";

/**
 * Ejecuta una pasada mínima: construye `ContextBundle` desde `task.prompt` y devuelve `OrchestratorResult`.
 * Si `buildContextBundle` lanza, se relanza con mensaje claro (sin capas extra).
 */
export async function runOrchestrator(
  workspaceRoot: string,
  task: AgentTask,
): Promise<OrchestratorResult> {
  let context;
  try {
    context = await buildContextBundle(workspaceRoot, task.prompt);
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    throw new Error(`No se pudo construir el contexto: ${detail}`);
  }

  const fileCount = context.files.length;
  const summary =
    fileCount === 0
      ? `Tarea ${task.id}: sin archivos en el contexto. ${context.rationale ?? ""}`.trim()
      : `Tarea ${task.id}: contexto con ${fileCount} archivo(s). ${context.rationale ?? ""}`.trim();

  return { summary, context };
}

/**
 * Pasada interna explícita: ejecuta una tool por nombre (sin modelo ni routing por prompt).
 * `task` solo aporta trazabilidad en el `summary` (p. ej. `task.id`).
 */
export async function runOrchestratorTool(
  workspaceRoot: string,
  task: AgentTask,
  toolName: string,
  toolInput: unknown,
): Promise<OrchestratorToolPassResult> {
  const toolResult = await runAgentTool(workspaceRoot, toolName, toolInput);

  if (toolResult.ok) {
    let summary = `Tarea ${task.id}: tool "${toolName}" OK`;
    if (
      toolName === "read_repo_file" &&
      toolResult.data !== null &&
      typeof toolResult.data === "object" &&
      !Array.isArray(toolResult.data)
    ) {
      const p = (toolResult.data as { path?: unknown }).path;
      if (typeof p === "string" && p.length > 0) {
        summary = `Tarea ${task.id}: read_repo_file leyó "${p}"`;
      }
    }
    return { summary, toolResult };
  }

  return {
    summary: `Tarea ${task.id}: tool "${toolName}" falló — ${toolResult.error}`,
    toolResult,
  };
}

/**
 * Pasada explícita: diff preview respecto a `nextContent` (sin apply; errores se propagan).
 * `task` solo aporta trazabilidad en el `summary`.
 */
export async function runOrchestratorEditPreview(
  workspaceRoot: string,
  task: AgentTask,
  relativePath: string,
  nextContent: string,
): Promise<OrchestratorEditPreviewPassResult> {
  const editPreview = await createEditPreview(workspaceRoot, relativePath, nextContent);
  const rel = relativePath.trim().replace(/\\/g, "/");
  const summary = `Tarea ${task.id}: preview listo para "${rel}"`;
  return { summary, editPreview };
}

/**
 * Ejecuta una tarea sobre una sesión: estado en memoria + `runOrchestrator`.
 * Si el orquestador falla, deja el error en `recentErrors` y relanza.
 */
export async function runAgentTask(
  workspaceRoot: string,
  sessionId: string,
  task: AgentTask,
): Promise<OrchestratorResult> {
  const existing = await getSessionState(sessionId);
  const base: AgentSessionState = existing ?? createSessionState(sessionId);

  const ready: AgentSessionState = {
    ...base,
    sessionId,
    currentTask: task,
    recentErrors: [],
  };
  await setSessionState(ready);

  try {
    const result = await runOrchestrator(workspaceRoot, task);
    const fromContext = result.context?.files.map((f) => f.path) ?? [];
    const touchedPaths = [...new Set([...ready.touchedPaths, ...fromContext])];
    const done: AgentSessionState = {
      ...ready,
      activePlan: result.summary,
      touchedPaths,
    };
    await setSessionState(done);
    return result;
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    const failed: AgentSessionState = {
      ...ready,
      recentErrors: [{ message, source: "orchestrator" }],
    };
    await setSessionState(failed);
    throw cause;
  }
}
