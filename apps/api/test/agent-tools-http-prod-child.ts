/**
 * Proceso hijo: primera carga de `chat.ts` con `NODE_ENV=production` → sin rutas de instrumentación.
 * Invocado solo desde `agent-tools-http.test.ts` vía `spawnSync`.
 */
async function main(): Promise<void> {
  process.env.NODE_ENV = "production";

  const { default: Fastify } = await import("fastify");
  const { chatRoutes } = await import("../src/routes/chat.js");

  const app = Fastify({ logger: false });
  await app.register(chatRoutes, { prefix: "/chat" });

  const res = await app.inject({
    method: "POST",
    url: "/chat/sessions/cmh7fakeid000000000000/agent-tools/read_repo_file",
    headers: { "content-type": "application/json" },
    payload: JSON.stringify({ input: { path: "package.json" } }),
  });

  await app.close();

  if (res.statusCode !== 404) {
    console.error(`expected 404 for unregistered route, got ${res.statusCode}: ${res.body}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
