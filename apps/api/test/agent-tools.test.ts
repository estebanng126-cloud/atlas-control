/**
 * Carril CONTRACT: `runAgentTool` + `read_repo_file`. Sin DB ni HTTP.
 * `pnpm run test:contract`
 */
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { runAgentTool } from "../src/agent/tools/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
/** Raíz del monorepo: `apps/api/test` → `..` api → `..` apps → `..` repo. */
const workspaceRoot = resolve(__dirname, "..", "..", "..");

test("runAgentTool read_repo_file — éxito leyendo archivo real del repo", async () => {
  const relPath = "package.json";
  const result = await runAgentTool(workspaceRoot, "read_repo_file", { path: relPath });

  assert.equal(result.toolName, "read_repo_file");
  assert.equal(result.ok, true);
  if (!result.ok) {
    assert.fail("esperado ok true");
  }
  assert.ok(result.data !== null && typeof result.data === "object" && !Array.isArray(result.data));
  const data = result.data as { path?: unknown; content?: unknown };
  assert.equal(data.path, relPath);
  assert.ok(typeof data.content === "string");
  assert.ok(data.content.length > 0);
  assert.ok(data.content.includes('"name"'), "package.json del monorepo debe contener JSON de paquete");
});

test("runAgentTool read_repo_file — fallo path inexistente", async () => {
  const result = await runAgentTool(workspaceRoot, "read_repo_file", {
    path: "__b34_no_existe__.txt",
  });

  assert.equal(result.toolName, "read_repo_file");
  assert.equal(result.ok, false);
  if (result.ok) {
    assert.fail("esperado ok false");
  }
  assert.ok(typeof result.error === "string");
  assert.ok(result.error.trim().length > 0);
});

test("runAgentTool — tool inexistente", async () => {
  const result = await runAgentTool(workspaceRoot, "no_existe_esta_tool", {});

  assert.equal(result.toolName, "no_existe_esta_tool");
  assert.equal(result.ok, false);
  if (result.ok) {
    assert.fail("esperado ok false");
  }
  assert.ok(result.error.includes("Unknown tool"));
});
