import type {
  ChatSessionDetail,
  ChatSessionListItem,
  CreateChatMessageInput,
  CreateChatSessionInput,
} from "@atlas/types";

type ErrorResponse = {
  message?: string;
};

/**
 * - Dev: base vacía → `/chat/*` en el origen de Vite → proxy a la API.
 * - Build + preview con proxy: igual (base vacía) si no defines `VITE_API_BASE_URL`.
 * - API en otro origen (prod real): define `VITE_API_BASE_URL` en el build; no hay fallback a localhost.
 */
function getChatApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") {
    return fromEnv.trim().replace(/\/$/, "");
  }
  return "";
}

function chatRequestUrl(path: string): string {
  const base = getChatApiBaseUrl();
  return base === "" ? path : `${base}${path}`;
}

async function readResponseText(response: Response): Promise<string> {
  return response.text();
}

async function readJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const text = await readResponseText(response);
    throw new Error(
      `Expected JSON but received ${contentType || "unknown content-type"}: ${text.slice(0, 120)}`,
    );
  }

  return (await response.json()) as T;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(chatRequestUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const payload: ErrorResponse = await readJson<ErrorResponse>(response).catch(() => ({}));
      throw new Error(payload.message ?? `Request failed with status ${response.status}`);
    }

    const text = await readResponseText(response);
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 160)}`);
  }

  return readJson<T>(response);
}

export function listSessions(): Promise<ChatSessionListItem[]> {
  return request<ChatSessionListItem[]>("/chat/sessions");
}

export function getSession(sessionId: string): Promise<ChatSessionDetail> {
  return request<ChatSessionDetail>(`/chat/sessions/${sessionId}`);
}

export function createSession(
  input: CreateChatSessionInput = {},
): Promise<ChatSessionDetail> {
  return request<ChatSessionDetail>("/chat/sessions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Espejo de `OrchestratorResult` en API (`apps/api/src/agent/types/index.ts`).
 * Mantener alineado con el contrato B.24 / `PostChatMessagesSuccessWithAgentResult`.
 */
export type AgentOrchestratorResultDto = {
  summary: string;
  context?: {
    files: readonly { path: string; content: string }[];
    rationale?: string;
  };
  editPreviews?: readonly { path: string; unifiedDiff: string }[];
};

/** POST …/messages — HTTP 200, chat+IA OK, agente OK (`result`, sin `agentError`). */
export type SendChatMessageSuccessWithAgentResult = ChatSessionDetail & {
  ok: true;
  result: AgentOrchestratorResultDto;
};

/** POST …/messages — HTTP 200, chat+IA OK, agente degradado (`agentError`, sin `result`). */
export type SendChatMessageSuccessWithAgentError = ChatSessionDetail & {
  ok: true;
  agentError: string;
};

/**
 * Cuerpo 200 de `POST …/messages` (el cliente `request` solo devuelve esto; errores previos al chat lanzan).
 * Mutuamente excluyente: `result` XOR `agentError`, nunca ambos.
 */
export type SendChatMessageApiResponse =
  | SendChatMessageSuccessWithAgentResult
  | SendChatMessageSuccessWithAgentError;

export function chatSessionDetailFromSendMessageResponse(
  res: SendChatMessageApiResponse,
): ChatSessionDetail {
  if ("result" in res) {
    const { ok: _ok, result: _result, ...session } = res;
    return session;
  }
  const { ok: _ok, agentError: _agentError, ...session } = res;
  return session;
}

export function sendMessage(
  sessionId: string,
  content: string,
): Promise<SendChatMessageApiResponse> {
  const payload: CreateChatMessageInput = { content };

  return request<SendChatMessageApiResponse>(`/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Estado del runtime del agente (solo lectura). `null` si 404 o fallo de red/parseo — sin lanzar. */
export type AgentSessionStateDto = {
  sessionId: string;
  currentTask: { id: string; prompt: string } | null;
  touchedPaths: readonly string[];
  activePlan: string | null;
  recentErrors: readonly { message: string; source?: string }[];
};

export async function fetchAgentSessionState(sessionId: string): Promise<AgentSessionStateDto | null> {
  try {
    const response = await fetch(chatRequestUrl(`/chat/sessions/${sessionId}/agent-state`), {
      headers: { "Content-Type": "application/json" },
    });
    if (response.status === 404 || !response.ok) {
      return null;
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return null;
    }
    const data = (await response.json()) as { ok?: boolean; agentSession?: AgentSessionStateDto };
    if (!data.ok || !data.agentSession) {
      return null;
    }
    return data.agentSession;
  } catch {
    return null;
  }
}
