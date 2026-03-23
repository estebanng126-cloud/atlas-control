/**
 * Carril CONTRACT (rápido, determinista): `pnpm test` y `pnpm run test:contract`.
 *
 * Degradación forzada del agente tras chat+IA OK: 200 + agentError sin result.
 * Inyección: `ChatRoutesPluginOptions.runAgentTaskOverride`.
 * Depende de DB + IA hasta el agente; el fallo del agente no es aleatorio.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { db } from "@atlas/db";
import Fastify from "fastify";
import { chatRoutes } from "../src/routes/chat.js";

await import("../src/load-env.js");

const INJECTED_AGENT_ERROR = "B28 injected agent failure";

test("POST /chat/.../messages — 200 degradado: sesión plana, agentError, sin result", async () => {
  const app = Fastify({ logger: false });
  await app.register(chatRoutes, {
    prefix: "/chat",
    runAgentTaskOverride: async () => {
      throw new Error(INJECTED_AGENT_ERROR);
    },
  });
  app.addHook("onClose", async () => {
    await db.$disconnect();
  });

  try {
    const createRes = await app.inject({
      method: "POST",
      url: "/chat/sessions",
      headers: { "content-type": "application/json" },
      payload: {},
    });

    assert.equal(createRes.statusCode, 201);
    const created = JSON.parse(createRes.body) as { id: string };
    assert.ok(created.id);

    const msgRes = await app.inject({
      method: "POST",
      url: `/chat/sessions/${created.id}/messages`,
      headers: { "content-type": "application/json" },
      payload: { content: "B28: mensaje para degradación controlada del agente" },
    });

    assert.equal(
      msgRes.statusCode,
      200,
      `esperado 200, recibido ${msgRes.statusCode}: ${msgRes.body.slice(0, 500)}`,
    );

    const body = JSON.parse(msgRes.body) as Record<string, unknown>;

    assert.equal(body.ok, true);
    assert.equal(body.id, created.id);
    assert.ok(!Object.hasOwn(body, "result"), "no debe existir result en degradación");
    assert.ok(Object.hasOwn(body, "agentError"));
    assert.equal(body.agentError, INJECTED_AGENT_ERROR);

    const messages = body.messages as { role: string; content: string }[];
    assert.ok(Array.isArray(messages) && messages.length >= 2);
    const lastUser = messages.filter((m) => m.role === "USER").pop();
    const lastAssistant = messages.filter((m) => m.role === "ASSISTANT").pop();
    assert.ok(lastUser?.content.includes("B28:"));
    assert.ok(lastAssistant && lastAssistant.content.trim().length > 0);
  } finally {
    await app.close();
  }
});
