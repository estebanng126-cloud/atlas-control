/**
 * Sesión del agente persistida en `ChatSession.agentState` (misma DB que el chat).
 * Ver docs/agent-runtime-plan.md
 */

import { db } from "@atlas/db";
import type { AgentSessionState } from "../types/index.js";

function cloneState(state: AgentSessionState): AgentSessionState {
  return {
    sessionId: state.sessionId,
    currentTask:
      state.currentTask === null
        ? null
        : { id: state.currentTask.id, prompt: state.currentTask.prompt },
    touchedPaths: [...state.touchedPaths],
    activePlan: state.activePlan,
    recentErrors: state.recentErrors.map((e) =>
      e.source !== undefined
        ? { message: e.message, source: e.source }
        : { message: e.message },
    ),
  };
}

function parseAgentSessionState(value: unknown): AgentSessionState | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const o = value as Record<string, unknown>;
  if (typeof o.sessionId !== "string") {
    return undefined;
  }

  let currentTask: AgentSessionState["currentTask"] = null;
  if (o.currentTask !== null && o.currentTask !== undefined) {
    if (typeof o.currentTask !== "object" || Array.isArray(o.currentTask)) {
      return undefined;
    }
    const t = o.currentTask as Record<string, unknown>;
    if (typeof t.id !== "string" || typeof t.prompt !== "string") {
      return undefined;
    }
    currentTask = { id: t.id, prompt: t.prompt };
  }

  if (!Array.isArray(o.touchedPaths) || !o.touchedPaths.every((p): p is string => typeof p === "string")) {
    return undefined;
  }
  const touchedPaths = o.touchedPaths as string[];

  let activePlan: string | null = null;
  if (o.activePlan !== undefined && o.activePlan !== null) {
    if (typeof o.activePlan !== "string") {
      return undefined;
    }
    activePlan = o.activePlan;
  }

  if (!Array.isArray(o.recentErrors)) {
    return undefined;
  }
  const recentErrors: { message: string; source?: string }[] = [];
  for (const e of o.recentErrors) {
    if (typeof e !== "object" || e === null || Array.isArray(e)) {
      return undefined;
    }
    const er = e as Record<string, unknown>;
    if (typeof er.message !== "string") {
      return undefined;
    }
    if (er.source !== undefined && typeof er.source !== "string") {
      return undefined;
    }
    recentErrors.push(
      er.source !== undefined ? { message: er.message, source: er.source } : { message: er.message },
    );
  }

  return {
    sessionId: o.sessionId,
    currentTask,
    touchedPaths,
    activePlan,
    recentErrors,
  };
}

function toDbJson(state: AgentSessionState): object {
  return JSON.parse(JSON.stringify(cloneState(state))) as object;
}

/** Estado inicial vacío (no escribe en DB hasta `setSessionState`). */
export function createSessionState(sessionId: string): AgentSessionState {
  return {
    sessionId,
    currentTask: null,
    touchedPaths: [],
    activePlan: null,
    recentErrors: [],
  };
}

/** Copia del estado persistido, o `undefined` si no hay fila de chat o `agentState` vacío / inválido. */
export async function getSessionState(sessionId: string): Promise<AgentSessionState | undefined> {
  const row = await db.chatSession.findUnique({
    where: { id: sessionId },
    select: { agentState: true },
  });
  if (row === null || row.agentState === null || row.agentState.trim() === "") {
    return undefined;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(row.agentState) as unknown;
  } catch {
    return undefined;
  }
  const parsed = parseAgentSessionState(raw);
  return parsed !== undefined ? cloneState(parsed) : undefined;
}

/** Persiste el estado completo en la fila `ChatSession` (mismo `sessionId`). */
export async function setSessionState(state: AgentSessionState): Promise<void> {
  const json = JSON.stringify(toDbJson(state));
  await db.chatSession.update({
    where: { id: state.sessionId },
    data: { agentState: json },
  });
}

/** Limpia `agentState` en la sesión de chat si existe la fila. */
export async function clearSessionState(sessionId: string): Promise<void> {
  await db.chatSession.updateMany({
    where: { id: sessionId },
    data: { agentState: null },
  });
}
