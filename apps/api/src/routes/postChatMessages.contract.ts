import type { ChatSessionDetail } from "@atlas/types";
import type { OrchestratorResult } from "../agent/types/index.js";

/**
 * Contrato oficial `POST /chat/sessions/:sessionId/messages` (cuerpo JSON).
 *
 * Casos previos al flujo principal (chat persistido + IA): HTTP 400, 404 o código de `ai_error`.
 * Cuerpo: error estructurado; no hay sesión plana de éxito en estos casos.
 */
export type PostChatMessagesErrorBody = {
  ok: false;
  error: string;
  message: string;
};

/**
 * HTTP 200 tras persistir chat + IA con éxito. Invariantes:
 * - Los campos de `ChatSessionDetail` (sesión plana) van siempre en el objeto raíz.
 * - Un fallo del agente después de eso no revierte el chat: `ok` sigue siendo `true`.
 * - En un mismo payload 200 válido no coexisten `result` y `agentError`.
 */
export type PostChatMessagesSuccessWithAgentResult = ChatSessionDetail & {
  ok: true;
  result: OrchestratorResult;
};

export type PostChatMessagesSuccessWithAgentError = ChatSessionDetail & {
  ok: true;
  agentError: string;
};

/** Unión de respuestas 200 del endpoint (agente OK vs degradado). */
export type PostChatMessagesSuccessBody =
  | PostChatMessagesSuccessWithAgentResult
  | PostChatMessagesSuccessWithAgentError;

/** Unión de todos los cuerpos JSON devueltos por el handler (el status HTTP discrimina 200 vs error). */
export type PostChatMessagesResponseBody =
  | PostChatMessagesErrorBody
  | PostChatMessagesSuccessBody;
