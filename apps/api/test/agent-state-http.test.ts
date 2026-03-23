/**
 * Carril CONTRACT: `GET /chat/sessions/:sessionId/agent-state` refleja `ChatSession.agentState` en DB.
 * Requiere instrumentación (no `NODE_ENV=production`). `pnpm run test:contract`.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { AgentSessionState } from "../src/agent/types/index.js";

process.env.NODE_ENV ??= "test";

await import("../src/load-env.js");

const { default: Fastify } = await import("fastify");
const { db } = await import("@atlas/db");
const { chatRoutes } = await import("../src/routes/chat.js");
const { createChatSession } = await import("../src/services/chat.js");
const { setSessionState } = await import("../src/agent/session/index.js");

async function buildAppWithAgentStateRoute() {
  const app = Fastify({ logger: false });
  await app.register(chatRoutes, { prefix: "/chat" });
  return app;
}

test("GET …/agent-state — 200 y agentSession alineado con DB", async () => {
  const app = await buildAppWithAgentStateRoute();
  const chat = await createChatSession({});
  const sessionId = chat.id;

  try {
    const state: AgentSessionState = {
      sessionId,
      currentTask: { id: "http-b32", prompt: "ver vía HTTP" },
      touchedPaths: ["a.ts"],
      activePlan: "plan B32",
      recentErrors: [{ message: "e1" }],
    };
    await setSessionState(state);

    const rowBefore = await db.chatSession.findUnique({
      where: { id: sessionId },
      select: { agentState: true },
    });
    assert.ok(rowBefore?.agentState);
    const snapshotFromDb = JSON.parse(rowBefore.agentState) as AgentSessionState;

    const res = await app.inject({
      method: "GET",
      url: `/chat/sessions/${sessionId}/agent-state`,
    });

    assert.equal(res.statusCode, 200, res.body);
    const body = JSON.parse(res.body) as {
      ok: boolean;
      agentSession: AgentSessionState;
    };
    assert.equal(body.ok, true);
    assert.deepEqual(body.agentSession, snapshotFromDb);
    assert.deepEqual(body.agentSession.currentTask, state.currentTask);
    assert.deepEqual([...body.agentSession.touchedPaths], [...state.touchedPaths]);
    assert.equal(body.agentSession.activePlan, state.activePlan);
    assert.equal(body.agentSession.recentErrors.length, 1);
    assert.equal(body.agentSession.recentErrors[0]?.message, "e1");
  } finally {
    await app.close();
    await db.chatSession.delete({ where: { id: sessionId } }).catch(() => {});
  }
});

test("GET …/agent-state — 404 sin fila agentState", async () => {
  const app = await buildAppWithAgentStateRoute();
  const chat = await createChatSession({});
  const sessionId = chat.id;

  try {
    const row = await db.chatSession.findUnique({
      where: { id: sessionId },
      select: { agentState: true },
    });
    assert.equal(row?.agentState, null);

    const res = await app.inject({
      method: "GET",
      url: `/chat/sessions/${sessionId}/agent-state`,
    });

    assert.equal(res.statusCode, 404);
    const body = JSON.parse(res.body) as { ok: boolean; error: string };
    assert.equal(body.ok, false);
    assert.ok(typeof body.error === "string" && body.error.length > 0);
  } finally {
    await app.close();
    await db.chatSession.delete({ where: { id: sessionId } }).catch(() => {});
  }
});
