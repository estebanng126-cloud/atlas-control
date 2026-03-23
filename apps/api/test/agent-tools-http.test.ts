/**
 * Carril CONTRACT: `POST …/agent-tools/:toolName` (solo DEV). Caso prod vía proceso hijo (módulo fresco).
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { db } from "@atlas/db";

process.env.NODE_ENV ??= "test";

await import("../src/load-env.js");

const { default: Fastify } = await import("fastify");
const { chatRoutes } = await import("../src/routes/chat.js");
const { createChatSession } = await import("../src/services/chat.js");

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiRoot = resolve(__dirname, "..");

async function buildApp() {
  const app = Fastify({ logger: false });
  await app.register(chatRoutes, { prefix: "/chat" });
  return app;
}

test("POST agent-tools — éxito read_repo_file + package.json", async () => {
  const app = await buildApp();
  const chat = await createChatSession({});

  try {
    const res = await app.inject({
      method: "POST",
      url: `/chat/sessions/${chat.id}/agent-tools/read_repo_file`,
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        taskPrompt: "b38",
        input: { path: "package.json" },
      }),
    });

    assert.equal(res.statusCode, 200, res.body);
    const body = JSON.parse(res.body) as {
      ok: boolean;
      sessionId: string;
      toolName: string;
      summary: string;
      toolResult: { toolName: string; ok: boolean; data?: { path?: string; content?: string }; error?: string };
    };

    assert.equal(body.ok, true);
    assert.equal(body.sessionId, chat.id);
    assert.equal(body.toolName, "read_repo_file");
    assert.ok(body.summary.trim().length > 0);
    assert.equal(body.toolResult.toolName, "read_repo_file");
    assert.equal(body.toolResult.ok, true);
    if (!body.toolResult.ok || !body.toolResult.data) {
      assert.fail("toolResult éxito con data");
    }
    const d = body.toolResult.data as { path: string; content: string };
    assert.equal(d.path, "package.json");
    assert.ok(typeof d.content === "string" && d.content.length > 0);
  } finally {
    await app.close();
    await db.chatSession.delete({ where: { id: chat.id } }).catch(() => {});
  }
});

test("POST agent-tools — tool falla (path inexistente), HTTP 200", async () => {
  const app = await buildApp();
  const chat = await createChatSession({});

  try {
    const res = await app.inject({
      method: "POST",
      url: `/chat/sessions/${chat.id}/agent-tools/read_repo_file`,
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        input: { path: "__b38_missing__.txt" },
      }),
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body) as {
      ok: boolean;
      toolResult: { ok: boolean; error?: string };
      summary: string;
    };

    assert.equal(body.ok, true);
    assert.equal(body.toolResult.ok, false);
    if (body.toolResult.ok) {
      assert.fail("esperado tool fallida");
    }
    assert.ok(body.toolResult.error && body.toolResult.error.length > 0);
    assert.ok(body.summary.includes("falló"), `summary debe reflejar fallo: ${body.summary}`);
    assert.ok(body.summary.includes(body.toolResult.error), "summary incluye error de tool");
  } finally {
    await app.close();
    await db.chatSession.delete({ where: { id: chat.id } }).catch(() => {});
  }
});

test("POST agent-tools — 404 sesión inexistente", async () => {
  const app = await buildApp();

  try {
    const res = await app.inject({
      method: "POST",
      url: "/chat/sessions/cmh7nonexistent000000000000/agent-tools/read_repo_file",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ input: { path: "package.json" } }),
    });

    assert.equal(res.statusCode, 404);
    const body = JSON.parse(res.body) as { ok: boolean; error?: string };
    assert.equal(body.ok, false);
    assert.ok(body.error && body.error.length > 0);
  } finally {
    await app.close();
  }
});

test("POST agent-tools — ruta no registrada con NODE_ENV=production (proceso hijo)", () => {
  const child = join(__dirname, "agent-tools-http-prod-child.ts");
  const r = spawnSync(process.execPath, ["--import", "tsx", child], {
    cwd: apiRoot,
    encoding: "utf8",
    env: { ...process.env, NODE_ENV: "production" },
  });

  assert.equal(r.status, 0, `child exit ${r.status}\nstdout:\n${r.stdout}\nstderr:\n${r.stderr}`);
});
