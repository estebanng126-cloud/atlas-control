import "./load-env.js";
import Fastify from "fastify";
import { db } from "@atlas/db";
import type { HealthResponse } from "@atlas/types";
import { chatRoutes } from "./routes/chat";

const app = Fastify({ logger: true });
const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3001);

app.addHook("onRequest", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Headers", "Content-Type");
  reply.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (request.method === "OPTIONS") {
    await reply.code(204).send();
  }
});

app.get("/health", async () => {
  const payload: HealthResponse = { ok: true };
  return payload;
});

app.register(chatRoutes, { prefix: "/chat" });

const start = async () => {
  try {
    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

app.addHook("onClose", async () => {
  await db.$disconnect();
});

start();
