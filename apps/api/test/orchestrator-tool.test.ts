/**
 * Carril CONTRACT: `runOrchestratorTool` (pasada explícita, sin HTTP).
 * `pnpm run test:contract`
 */
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { runOrchestratorTool } from "../src/agent/orchestrator/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(__dirname, "..", "..", "..");

const taskB36 = { id: "b36-fixed", prompt: "trazabilidad de prueba" };

test("runOrchestratorTool — éxito read_repo_file + summary estable", async () => {
  const relPath = "package.json";
  const out = await runOrchestratorTool(workspaceRoot, taskB36, "read_repo_file", { path: relPath });

  assert.equal(out.summary, `Tarea ${taskB36.id}: read_repo_file leyó "${relPath}"`);

  assert.equal(out.toolResult.toolName, "read_repo_file");
  assert.equal(out.toolResult.ok, true);
  if (!out.toolResult.ok) {
    assert.fail("esperado toolResult.ok true");
  }
  const data = out.toolResult.data as { path?: unknown; content?: unknown };
  assert.equal(data.path, relPath);
  assert.ok(typeof data.content === "string" && data.content.length > 0);
});

test("runOrchestratorTool — read_repo_file path inválido + summary de fallo", async () => {
  const out = await runOrchestratorTool(workspaceRoot, taskB36, "read_repo_file", {
    path: "__b36_missing__.txt",
  });

  assert.equal(out.toolResult.toolName, "read_repo_file");
  assert.equal(out.toolResult.ok, false);
  if (out.toolResult.ok) {
    assert.fail("esperado toolResult.ok false");
  }
  assert.ok(out.toolResult.error.trim().length > 0);

  const expectedPrefix = `Tarea ${taskB36.id}: tool "read_repo_file" falló — `;
  assert.ok(
    out.summary.startsWith(expectedPrefix),
    `summary debe empezar por "${expectedPrefix}", recibido: ${out.summary}`,
  );
  assert.ok(out.summary.includes(out.toolResult.error), "summary debe incluir el mensaje de error de la tool");
});
