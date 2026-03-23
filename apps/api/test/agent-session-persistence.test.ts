/**
 * Carril CONTRACT: persistencia real de `AgentSessionState` en `ChatSession.agentState`.
 * `pnpm run test:contract` (sin IA). Requiere `DATABASE_URL` y migración B.30 aplicada.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { db } from "@atlas/db";
import type { AgentSessionState } from "../src/agent/types/index.js";
import {
  clearSessionState,
  createSessionState,
  getSessionState,
  setSessionState,
} from "../src/agent/session/index.js";
import { createChatSession } from "../src/services/chat.js";

await import("../src/load-env.js");

test("AgentSessionState: set → DB → get → clear (sin Map en proceso)", async () => {
  const chat = await createChatSession({});
  const sessionId = chat.id;

  try {
    const state: AgentSessionState = {
      sessionId,
      currentTask: { id: "task-b31", prompt: "persistencia" },
      touchedPaths: ["src/foo.ts", "src/bar.ts"],
      activePlan: "plan activo B31",
      recentErrors: [{ message: "error de prueba", source: "orchestrator" }],
    };

    await setSessionState(state);

    const row = await db.chatSession.findUnique({
      where: { id: sessionId },
      select: { agentState: true },
    });
    assert.ok(row?.agentState, "ChatSession.agentState debe existir en DB");
    const rawParsed = JSON.parse(row.agentState) as Record<string, unknown>;
    assert.equal(rawParsed.sessionId, sessionId);
    assert.deepEqual(rawParsed.touchedPaths, ["src/foo.ts", "src/bar.ts"]);
    assert.equal(rawParsed.activePlan, "plan activo B31");

    const first = await getSessionState(sessionId);
    assert.ok(first);
    assert.equal(first.sessionId, sessionId);
    assert.deepEqual(first.currentTask, { id: "task-b31", prompt: "persistencia" });
    assert.deepEqual([...first.touchedPaths], ["src/foo.ts", "src/bar.ts"]);
    assert.equal(first.activePlan, "plan activo B31");
    assert.equal(first.recentErrors.length, 1);
    assert.equal(first.recentErrors[0]?.message, "error de prueba");
    assert.equal(first.recentErrors[0]?.source, "orchestrator");

    const second = await getSessionState(sessionId);
    assert.ok(second);
    assert.deepEqual(second.currentTask, first.currentTask);
    assert.notStrictEqual(second, first, "getSessionState devuelve copias, no referencia compartida");

    const emptyCreate = createSessionState(sessionId);
    assert.equal(emptyCreate.currentTask, null, "createSessionState no lee DB");

    await clearSessionState(sessionId);

    const afterClear = await getSessionState(sessionId);
    assert.equal(afterClear, undefined);

    const rowAfter = await db.chatSession.findUnique({
      where: { id: sessionId },
      select: { agentState: true },
    });
    assert.equal(rowAfter?.agentState, null);
  } finally {
    await db.chatSession.delete({ where: { id: sessionId } }).catch(() => {
      /* sesión ya borrada */
    });
  }
});
