import type {
  CreateChatMessageInput,
  CreateChatSessionInput,
} from "@atlas/types";
import type { FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import path from "node:path";
import { runAgentTask, runOrchestratorEditPreview, runOrchestratorTool } from "../agent/index.js";
import { getSessionState } from "../agent/session/index.js";
import {
  createChatSession,
  getChatSessionDetail,
  listChatSessions,
  sendChatMessage,
} from "../services/chat";
import type {
  PostChatMessagesErrorBody,
  PostChatMessagesSuccessWithAgentError,
  PostChatMessagesSuccessWithAgentResult,
} from "./postChatMessages.contract.js";

/**
 * Raíz del monorepo para el runtime del agente.
 * Temporal: asume `cwd` en `apps/api` al arrancar con `pnpm dev` / `tsx` (sube dos niveles).
 */
const AGENT_WORKSPACE_ROOT = path.resolve(process.cwd(), "..", "..");

/** Instrumentación/debug interna del agente; no registrar en producción. */
const registerAgentInstrumentationRoutes =
  process.env.NODE_ENV !== "production";

type SessionParams = {
  sessionId: string;
};

type SessionToolParams = {
  sessionId: string;
  toolName: string;
};

/** Body de `POST …/agent-tools/:toolName` (solo DEV/debug). */
type AgentToolDebugBody = {
  /** Texto opcional para `AgentTask.prompt` (trazas). */
  taskPrompt?: string;
  /** Payload de la tool (p. ej. `{ path: "package.json" }` para `read_repo_file`). */
  input?: unknown;
};

/** Body de `POST …/agent-edit-preview` (solo DEV/debug). */
type AgentEditPreviewBody = {
  taskPrompt?: string;
  path: string;
  nextContent: string;
};

type ErrorPayload = {
  message: string;
};

/** Opciones del plugin; `runAgentTaskOverride` solo para tests (inyección determinista). */
export interface ChatRoutesPluginOptions extends FastifyPluginOptions {
  runAgentTaskOverride?: typeof runAgentTask;
}

export const chatRoutes: FastifyPluginAsync<ChatRoutesPluginOptions> = async (app, opts) => {
  const executeAgentTask = opts.runAgentTaskOverride ?? runAgentTask;
  app.get("/sessions", async () => {
    return listChatSessions();
  });

  app.post<{ Body: CreateChatSessionInput }>("/sessions", async (request, reply) => {
    const session = await createChatSession(request.body ?? {});
    reply.code(201);
    return session;
  });

  if (registerAgentInstrumentationRoutes) {
    // GET agent-state: solo DEV/debug; no expuesto en prod.
    app.get<{ Params: SessionParams }>("/sessions/:sessionId/agent-state", async (request, reply) => {
      const state = await getSessionState(request.params.sessionId);
      if (state === undefined) {
        reply.code(404);
        return {
          ok: false,
          error: "No agent session state for this sessionId",
        };
      }
      return {
        ok: true,
        agentSession: state,
      };
    });

    /**
     * POST …/agent-tools/:toolName — solo DEV/debug; no existe en prod.
     * Ejecuta `runOrchestratorTool` con input explícito; no forma parte del contrato del chat.
     */
    app.post<{ Params: SessionToolParams; Body: AgentToolDebugBody }>(
      "/sessions/:sessionId/agent-tools/:toolName",
      async (request, reply) => {
        const { sessionId } = request.params;
        const toolName = request.params.toolName.trim();
        if (toolName.length === 0) {
          reply.code(400);
          return { ok: false, error: "toolName must be non-empty" };
        }

        if ((await getChatSessionDetail(sessionId)) === null) {
          reply.code(404);
          return { ok: false, error: "Chat session not found" };
        }

        const body = request.body ?? {};
        const prompt =
          typeof body.taskPrompt === "string" && body.taskPrompt.trim() !== ""
            ? body.taskPrompt.trim()
            : "(debug agent-tools)";
        const task = {
          id: `debug-tool-${Date.now()}`,
          prompt,
        };

        const pass = await runOrchestratorTool(
          AGENT_WORKSPACE_ROOT,
          task,
          toolName,
          body.input ?? {},
        );

        return {
          ok: true,
          sessionId,
          toolName,
          summary: pass.summary,
          toolResult: pass.toolResult,
        };
      },
    );

    /**
     * POST …/agent-edit-preview — solo DEV/debug; no existe en prod.
     * Diff preview vía `runOrchestratorEditPreview`; no escribe disco.
     */
    app.post<{ Params: SessionParams; Body: AgentEditPreviewBody }>(
      "/sessions/:sessionId/agent-edit-preview",
      async (request, reply) => {
        const { sessionId } = request.params;
        const body = request.body ?? {};

        if (typeof body.path !== "string" || body.path.trim() === "") {
          reply.code(400);
          return { ok: false, error: "path must be a non-empty string" };
        }
        if (typeof body.nextContent !== "string") {
          reply.code(400);
          return { ok: false, error: "nextContent must be a string" };
        }

        if ((await getChatSessionDetail(sessionId)) === null) {
          reply.code(404);
          return { ok: false, error: "Chat session not found" };
        }

        const prompt =
          typeof body.taskPrompt === "string" && body.taskPrompt.trim() !== ""
            ? body.taskPrompt.trim()
            : "(debug agent-edit-preview)";
        const task = {
          id: `debug-edit-preview-${Date.now()}`,
          prompt,
        };

        try {
          const pass = await runOrchestratorEditPreview(
            AGENT_WORKSPACE_ROOT,
            task,
            body.path.trim(),
            body.nextContent,
          );
          return {
            ok: true,
            sessionId,
            summary: pass.summary,
            editPreview: pass.editPreview,
          };
        } catch (cause) {
          const err = cause instanceof Error ? cause.message : String(cause);
          reply.code(400);
          return { ok: false, error: err };
        }
      },
    );
  }

  app.get<{ Params: SessionParams }>("/sessions/:sessionId", async (request, reply) => {
    const session = await getChatSessionDetail(request.params.sessionId);

    if (!session) {
      reply.code(404);
      return {
        message: "Chat session not found",
      } satisfies ErrorPayload;
    }

    return session;
  });

  /**
   * POST /chat/sessions/:sessionId/messages — contrato en `postChatMessages.contract.ts`.
   *
   * - 200 + éxito agente: `ok: true`, sesión plana, `result` (sin `agentError`).
   * - 200 + agente degradado: `ok: true`, sesión plana, `agentError` (sin `result`).
   * - Antes del flujo principal: 400 / 404 / `ai_error` con `PostChatMessagesErrorBody`.
   */
  app.post<{ Params: SessionParams; Body: CreateChatMessageInput }>(
    "/sessions/:sessionId/messages",
    async (request, reply) => {
      const content = request.body?.content ?? "";

      if (content.trim().length === 0) {
        reply.code(400);
        return {
          ok: false,
          error: "Message content is required",
          message: "Message content is required",
        } satisfies PostChatMessagesErrorBody;
      }

      const sessionId = request.params.sessionId;
      const chatOutcome = await sendChatMessage(sessionId, content);

      if (chatOutcome.status === "not_found") {
        reply.code(404);
        return {
          ok: false,
          error: "Chat session not found",
          message: "Chat session not found",
        } satisfies PostChatMessagesErrorBody;
      }

      if (chatOutcome.status === "ai_error") {
        reply.code(chatOutcome.statusCode);
        return {
          ok: false,
          error: chatOutcome.message,
          message: chatOutcome.message,
        } satisfies PostChatMessagesErrorBody;
      }

      const task = {
        id: `task-${Date.now()}`,
        prompt: content.trim(),
      };

      // Agente: capa adicional; si falla, no tumba la respuesta 200 del chat ya persistido.
      try {
        const agentResult = await executeAgentTask(AGENT_WORKSPACE_ROOT, sessionId, task);
        return {
          ok: true,
          result: agentResult,
          ...chatOutcome.session,
        } satisfies PostChatMessagesSuccessWithAgentResult;
      } catch (cause) {
        const err = cause instanceof Error ? cause.message : String(cause);
        request.log.warn(
          {
            sessionId,
            agentRuntimeError: err,
            flow: "post_chat_messages_agent_runtime",
          },
          "agent_runtime: fallo tras chat persistido",
        );
        return {
          ok: true,
          agentError: err,
          ...chatOutcome.session,
        } satisfies PostChatMessagesSuccessWithAgentError;
      }
    },
  );
};
