/**
 * Carril SMOKE (lento, integración viva): `pnpm run test:smoke` — no corre en `pnpm test` por defecto.
 *
 * POST /chat/sessions/:sessionId/messages (contrato B.24 / docs/chat-agent-contract.md).
 * Requiere `DATABASE_URL` y credenciales de IA válidas (mismo .env que `pnpm dev` en api).
 * Patrón: `node:test` + `Fastify.inject`.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { db } from "@atlas/db";
import Fastify from "fastify";
import { chatRoutes } from "../src/routes/chat.js";

await import("../src/load-env.js");

async function buildChatApp() {
  const app = Fastify({ logger: false });
  await app.register(chatRoutes, { prefix: "/chat" });
  app.addHook("onClose", async () => {
    await db.$disconnect();
  });
  return app;
}

test("POST /chat/.../messages — 200, sesión plana, ok true, result XOR agentError", async () => {
  const app = await buildChatApp();

  try {
    const createRes = await app.inject({
      method: "POST",
      url: "/chat/sessions",
      headers: { "content-type": "application/json" },
      payload: {},
    });

    assert.equal(createRes.statusCode, 201);
    const created = JSON.parse(createRes.body) as { id: string };
    assert.ok(created.id && typeof created.id === "string");

    const msgRes = await app.inject({
      method: "POST",
      url: `/chat/sessions/${created.id}/messages`,
      headers: { "content-type": "application/json" },
      payload: { content: "smoke: contrato POST messages + agente" },
    });

    assert.equal(
      msgRes.statusCode,
      200,
      `esperado 200, recibido ${msgRes.statusCode}: ${msgRes.body.slice(0, 500)}`,
    );

    const body = JSON.parse(msgRes.body) as Record<string, unknown>;

    assert.equal(body.ok, true);

    assert.equal(body.id, created.id);
    assert.ok(Array.isArray(body.messages));
    assert.ok(
      (body.messages as unknown[]).length >= 2,
      "sesión plana debe incluir al menos user + assistant tras IA OK",
    );
    assert.ok(typeof body.lastMessageAt === "string");
    assert.ok(typeof body.createdAt === "string");
    assert.ok(typeof body.updatedAt === "string");

    const hasResult = Object.hasOwn(body, "result");
    const hasAgentError = Object.hasOwn(body, "agentError");

    assert.ok(
      hasResult !== hasAgentError,
      "en 200 válido debe existir exactamente una rama: result o agentError, nunca ambas ni ninguna",
    );

    if (hasResult) {
      assert.ok(body.result != null && typeof body.result === "object");
      const result = body.result as { summary?: unknown };
      assert.ok(typeof result.summary === "string");
    } else {
      assert.ok(typeof body.agentError === "string");
      assert.ok((body.agentError as string).length > 0);
    }
  } finally {
    await app.close();
  }
});
