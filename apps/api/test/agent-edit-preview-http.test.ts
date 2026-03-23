/**
 * Carril CONTRACT: `POST …/agent-edit-preview` (solo DEV). Caso prod vía proceso hijo (módulo fresco).
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
const workspaceRoot = resolve(__dirname, "..", "..", "..");

async function buildApp() {
  const app = Fastify({ logger: false });
  await app.register(chatRoutes, { prefix: "/chat" });
  return app;
}

test("POST agent-edit-preview — éxito con diff package.json", async () => {
  const app = await buildApp();
  const chat = await createChatSession({});
  const current = await readFile(join(workspaceRoot, "package.json"), "utf8");
  const nextContent = `${current}\n/* b43-edit-preview */\n`;

  try {
    const res = await app.inject({
      method: "POST",
      url: `/chat/sessions/${chat.id}/agent-edit-preview`,
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        taskPrompt: "b43 preview",
        path: "package.json",
        nextContent,
      }),
    });

    assert.equal(res.statusCode, 200, res.body);
    const body = JSON.parse(res.body) as {
      ok: boolean;
      sessionId: string;
      summary: string;
      editPreview: { path: string; unifiedDiff: string };
    };

    assert.equal(body.ok, true);
    assert.equal(body.sessionId, chat.id);
    assert.ok(body.summary.trim().length > 0);
    assert.equal(body.editPreview.path, "package.json");
    assert.ok(typeof body.editPreview.unifiedDiff === "string");
    assert.ok(body.editPreview.unifiedDiff.length > 0);
    assert.ok(body.editPreview.unifiedDiff.includes("--- a/package.json"));
    assert.ok(body.editPreview.unifiedDiff.includes("+++ b/package.json"));
  } finally {
    await app.close();
    await db.chatSession.delete({ where: { id: chat.id } }).catch(() => {});
  }
});

test("POST agent-edit-preview — 400 path vacío o solo espacios", async () => {
  const app = await buildApp();
  const chat = await createChatSession({});

  try {
    const res = await app.inject({
      method: "POST",
      url: `/chat/sessions/${chat.id}/agent-edit-preview`,
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        path: "   ",
        nextContent: "x",
      }),
    });

    assert.equal(res.statusCode, 400);
    const body = JSON.parse(res.body) as { ok: boolean; error?: string };
    assert.equal(body.ok, false);
    assert.ok(body.error && body.error.length > 0);
  } finally {
    await app.close();
    await db.chatSession.delete({ where: { id: chat.id } }).catch(() => {});
  }
});

test("POST agent-edit-preview — 400 nextContent no string", async () => {
  const app = await buildApp();
  const chat = await createChatSession({});

  try {
    const res = await app.inject({
      method: "POST",
      url: `/chat/sessions/${chat.id}/agent-edit-preview`,
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        path: "package.json",
        nextContent: 123,
      }),
    });

    assert.equal(res.statusCode, 400);
    const body = JSON.parse(res.body) as { ok: boolean; error?: string };
    assert.equal(body.ok, false);
    assert.ok(body.error && body.error.length > 0);
  } finally {
    await app.close();
    await db.chatSession.delete({ where: { id: chat.id } }).catch(() => {});
  }
});

test("POST agent-edit-preview — 404 sesión inexistente", async () => {
  const app = await buildApp();

  try {
    const res = await app.inject({
      method: "POST",
      url: "/chat/sessions/cmh7nonexistent000000000000/agent-edit-preview",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        path: "package.json",
        nextContent: "{}",
      }),
    });

    assert.equal(res.statusCode, 404);
    const body = JSON.parse(res.body) as { ok: boolean; error?: string };
    assert.equal(body.ok, false);
    assert.ok(body.error && body.error.length > 0);
  } finally {
    await app.close();
  }
});

test("POST agent-edit-preview — ruta no registrada con NODE_ENV=production (proceso hijo)", () => {
  const child = join(__dirname, "agent-edit-preview-http-prod-child.ts");
  const r = spawnSync(process.execPath, ["--import", "tsx", child], {
    cwd: apiRoot,
    encoding: "utf8",
    env: { ...process.env, NODE_ENV: "production" },
  });

  assert.equal(r.status, 0, `child exit ${r.status}\nstdout:\n${r.stdout}\nstderr:\n${r.stderr}`);
});
