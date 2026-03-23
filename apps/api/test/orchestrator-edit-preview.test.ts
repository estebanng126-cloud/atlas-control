/**
 * Carril CONTRACT: `runOrchestratorEditPreview`. Sin DB ni HTTP.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { runOrchestratorEditPreview } from "../src/agent/orchestrator/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(__dirname, "..", "..", "..");

const taskB41 = { id: "b41-fixed", prompt: "preview test" };

test("runOrchestratorEditPreview — éxito con diff y summary exacto", async () => {
  const rel = "package.json";
  const current = await readFile(join(workspaceRoot, rel), "utf8");
  const nextContent = `${current}\n/* b41-edit-preview */\n`;

  const out = await runOrchestratorEditPreview(workspaceRoot, taskB41, rel, nextContent);

  assert.equal(out.summary, `Tarea ${taskB41.id}: preview listo para "${rel}"`);
  assert.equal(out.editPreview.path, rel);
  assert.ok(typeof out.editPreview.unifiedDiff === "string");
  assert.ok(out.editPreview.unifiedDiff.length > 0);
  assert.ok(out.editPreview.unifiedDiff.includes("--- a/package.json"));
  assert.ok(out.editPreview.unifiedDiff.includes("+++ b/package.json"));
});

test("runOrchestratorEditPreview — error si el archivo no existe (rechazo)", async () => {
  await assert.rejects(
    async () =>
      runOrchestratorEditPreview(workspaceRoot, taskB41, "__b41_missing__.txt", "nuevo contenido"),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.ok(err.message.trim().length > 0);
      return true;
    },
  );
});
