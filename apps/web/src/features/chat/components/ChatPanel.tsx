import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessageDto, ChatSessionDetail, ChatSessionListItem } from "@atlas/types";
import {
  IconCopy,
  IconEllipsis,
  IconPencil,
  IconRotateCcw,
} from "../../../components/icons/ChatMessageActionIcons";
import type { ChatRole } from "../chat.types";
import { getSessionLabel } from "../sessionLabel";
import {
  chatSessionDetailFromSendMessageResponse,
  createSession,
  fetchAgentSessionState,
  getSession,
  listSessions,
  sendMessage,
} from "../api/chat";
import { SHOW_AGENT_INSTRUMENTATION_STRIP } from "../agentInstrumentation";
import { AgentStatusStrip } from "./AgentStatusStrip";
import { ChatComposer } from "./ChatComposer";
import { ChatMessage } from "./ChatMessage";
import { ChatMessageActionButton } from "./ChatMessageActionButton";
import { ChatToolbarActions } from "./ChatToolbarActions";

const ACTIVE_SESSION_STORAGE_KEY = "atlas.chat.activeSessionId";

type MessageAction = {
  id: string;
  label: string;
  icon: JSX.Element;
};

type StatusTone = "default" | "error";

function getMessageRole(role: ChatMessageDto["role"]): ChatRole {
  if (role === "USER") {
    return "user";
  }

  return "assistant";
}

function getMessageActions(message: ChatMessageDto): readonly MessageAction[] {
  if (message.role === "USER") {
    return [
      { id: "edit", label: "Edit", icon: <IconPencil /> },
      { id: "more", label: "More", icon: <IconEllipsis /> },
    ];
  }

  return [
    { id: "copy", label: "Copy", icon: <IconCopy /> },
    { id: "retry", label: "Retry", icon: <IconRotateCcw /> },
    { id: "more", label: "More", icon: <IconEllipsis /> },
  ];
}

function getStoredActiveSessionId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
}

function persistActiveSessionId(sessionId: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (sessionId) {
    window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, sessionId);
    return;
  }

  window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
}

const AGENT_PATH_HINT_MAX = 36;

/** Solo para la franja debug: POSIX, truncado por el final si hace falta. */
function shortenPathForAgentStrip(path: string): string {
  const normalized = path.replace(/\\/g, "/").trim();
  if (normalized.length <= AGENT_PATH_HINT_MAX) {
    return normalized;
  }
  return `…${normalized.slice(-(AGENT_PATH_HINT_MAX - 1))}`;
}

const AGENT_ERR_STRIP_MAX = 52;

/** Una línea, sin saltos; truncado duro para la franja (no stack). */
function shortenRecentAgentError(message: string): string {
  const oneLine = message.replace(/\s+/g, " ").trim();
  if (oneLine.length <= AGENT_ERR_STRIP_MAX) {
    return oneLine;
  }
  return `${oneLine.slice(0, AGENT_ERR_STRIP_MAX - 1)}…`;
}

function getFriendlyErrorMessage(
  error: unknown,
  context: "sessions" | "session" | "create" | "send",
): string {
  const rawMessage = error instanceof Error ? error.message.toLowerCase() : "";

  if (rawMessage.includes("failed to fetch") || rawMessage.includes("network")) {
    return "The chat service is unavailable right now. Please try again in a moment.";
  }

  if (rawMessage.includes("not found")) {
    if (context === "session" || context === "send") {
      return "This chat session is no longer available.";
    }

    return "We couldn't find the requested chat data.";
  }

  if (context === "send" && error instanceof Error) {
    const message = error.message.trim();
    const lower = message.toLowerCase();
    if (
      message.length > 0 &&
      !lower.startsWith("http ") &&
      !message.includes("Expected JSON") &&
      !lower.includes("request failed with status")
    ) {
      return message;
    }
  }

  switch (context) {
    case "sessions":
      return "We couldn't load your chat sessions right now.";
    case "session":
      return "We couldn't load the messages for this chat.";
    case "create":
      return "We couldn't create a new chat just now.";
    case "send":
      return "Your message couldn't be sent. Please try again.";
  }
}

export function ChatPanel() {
  const [sessions, setSessions] = useState<ChatSessionListItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(getStoredActiveSessionId);
  const [activeSession, setActiveSession] = useState<ChatSessionDetail | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [sessionLoadVersion, setSessionLoadVersion] = useState(0);
  const [sessionListError, setSessionListError] = useState<string | null>(null);
  const [sessionDetailError, setSessionDetailError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  /** Testigo mínimo del runtime del agente; `null` = sin estado o error silencioso. */
  const [agentDebugSnapshot, setAgentDebugSnapshot] = useState<{
    activePlan: string | null;
    touchedCount: number;
    errorCount: number;
    sampleTouchedPaths: string[];
    /** `recentErrors[0].message` del agent-state, si existe. */
    recentErrorMessage?: string;
  } | null>(null);
  /** Último resultado del agente en el POST de mensaje (no viene en GET sesión). */
  const [agentEnrichment, setAgentEnrichment] = useState<{
    kind: "ok" | "degraded";
    detail: string;
    /** `result.context.files.length` cuando el POST trae `context.files`; si no, UI usa `touchedCount` del state. */
    postFilesCount?: number;
    /** Hasta 2 `path` desde `result.context.files` del POST. */
    postSamplePaths?: string[];
  } | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const refreshSessions = useCallback(async (preferredSessionId?: string) => {
    setIsLoadingSessions(true);

    try {
      const nextSessions = await listSessions();
      setSessions(nextSessions);
      setActiveSessionId((currentSessionId) => {
        if (preferredSessionId && nextSessions.some((session) => session.id === preferredSessionId)) {
          return preferredSessionId;
        }

        if (currentSessionId && nextSessions.some((session) => session.id === currentSessionId)) {
          return currentSessionId;
        }

        return nextSessions[0]?.id ?? null;
      });
      setSessionListError(null);
      return nextSessions;
    } catch (error) {
      setSessionListError(getFriendlyErrorMessage(error, "sessions"));
      return [];
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    void refreshSessions();
  }, [refreshSessions]);

  useEffect(() => {
    persistActiveSessionId(activeSessionId);
  }, [activeSessionId, sessionLoadVersion]);

  useEffect(() => {
    setAgentEnrichment(null);
  }, [activeSessionId]);

  useEffect(() => {
    if (!activeSessionId) {
      setActiveSession(null);
      setSessionDetailError(null);
      return;
    }

    let cancelled = false;

    const loadSession = async () => {
      setIsLoadingSession(true);

      try {
        const session = await getSession(activeSessionId);
        if (!cancelled) {
          setActiveSession(session);
          setSessionDetailError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setActiveSession(null);
          setSessionDetailError(getFriendlyErrorMessage(error, "session"));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSession(false);
        }
      }
    };

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [activeSessionId]);

  useEffect(() => {
    if (!SHOW_AGENT_INSTRUMENTATION_STRIP) {
      setAgentDebugSnapshot(null);
      return;
    }

    if (!activeSessionId || sessionDetailError || !activeSession) {
      setAgentDebugSnapshot(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      const state = await fetchAgentSessionState(activeSessionId);
      if (cancelled) {
        return;
      }
      if (!state) {
        setAgentDebugSnapshot(null);
        return;
      }
      const firstErr = state.recentErrors[0]?.message?.trim();
      setAgentDebugSnapshot({
        activePlan: state.activePlan,
        touchedCount: state.touchedPaths.length,
        errorCount: state.recentErrors.length,
        sampleTouchedPaths: [...state.touchedPaths].slice(0, 2),
        ...(firstErr && firstErr.length > 0 ? { recentErrorMessage: firstErr } : {}),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [activeSessionId, activeSession, sessionDetailError]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: "end" });
  }, [activeSession?.messages]);

  const handleCreateSession = useCallback(async () => {
    setIsCreatingSession(true);

    try {
      const session = await createSession();
      setActiveSession(session);
      setActiveSessionId(session.id);
      setSessionDetailError(null);
      setSendError(null);
      await refreshSessions(session.id);
    } catch (error) {
      setSessionListError(getFriendlyErrorMessage(error, "create"));
    } finally {
      setIsCreatingSession(false);
    }
  }, [refreshSessions]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeSessionId) {
        return;
      }

      setIsSendingMessage(true);

      try {
        const raw = await sendMessage(activeSessionId, content);
        const sessionRest = chatSessionDetailFromSendMessageResponse(raw);
        setActiveSession(sessionRest);

        if (SHOW_AGENT_INSTRUMENTATION_STRIP) {
          if ("result" in raw) {
            const { result } = raw;
            const postFilesCount =
              result.context != null && Array.isArray(result.context.files)
                ? result.context.files.length
                : undefined;

            const postSamplePaths =
              result.context != null && Array.isArray(result.context.files)
                ? result.context.files
                    .slice(0, 2)
                    .map((f) => f.path)
                    .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
                : [];

            if (typeof result.summary === "string" && result.summary.trim().length > 0) {
              const s = result.summary.trim();
              setAgentEnrichment({
                kind: "ok",
                detail: s.length > 80 ? `${s.slice(0, 80)}…` : s,
                ...(postFilesCount !== undefined ? { postFilesCount } : {}),
                ...(postSamplePaths.length > 0 ? { postSamplePaths } : {}),
              });
            } else {
              setAgentEnrichment(null);
            }
          } else {
            const { agentError } = raw;
            if (typeof agentError === "string" && agentError.length > 0) {
              const e = agentError.trim();
              setAgentEnrichment({
                kind: "degraded",
                detail: e.length > 80 ? `${e.slice(0, 80)}…` : e,
              });
            } else {
              setAgentEnrichment(null);
            }
          }
        } else {
          setAgentEnrichment(null);
        }

        setSessionDetailError(null);
        setSendError(null);
        await refreshSessions(sessionRest.id);
      } catch (error) {
        setSendError(getFriendlyErrorMessage(error, "send"));
        try {
          const synced = await getSession(activeSessionId);
          setActiveSession(synced);
        } catch {
          /* keep prior messages; user can reload */
        }
        throw error;
      } finally {
        setIsSendingMessage(false);
      }
    },
    [activeSessionId, refreshSessions],
  );

  const isComposerDisabled = useMemo(
    () => !activeSessionId || isLoadingSession || isCreatingSession,
    [activeSessionId, isLoadingSession, isCreatingSession],
  );

  /**
   * `files: N` solo junto a `agent:` (evita duplicar `touched` del bloque state).
   * Preferencia: `result.context.files.length` del POST; si no, `touchedPaths.length` del agent-state.
   */
  const agentLineFilesCount = useMemo(() => {
    if (!agentEnrichment) {
      return undefined;
    }
    if (agentEnrichment.postFilesCount !== undefined) {
      return agentEnrichment.postFilesCount;
    }
    if (agentDebugSnapshot) {
      return agentDebugSnapshot.touchedCount;
    }
    return undefined;
  }, [agentEnrichment, agentDebugSnapshot]);

  /** Máx. 2 rutas: primero `context.files` del POST, luego `touchedPaths` del agent-state. */
  const agentLinePathHints = useMemo(() => {
    const merged: string[] = [];
    for (const p of agentEnrichment?.postSamplePaths ?? []) {
      if (merged.length >= 2) break;
      merged.push(p);
    }
    for (const p of agentDebugSnapshot?.sampleTouchedPaths ?? []) {
      if (merged.length >= 2) break;
      if (!merged.includes(p)) merged.push(p);
    }
    return merged.slice(0, 2);
  }, [agentEnrichment?.postSamplePaths, agentDebugSnapshot?.sampleTouchedPaths]);

  const agentRecentErrorShort = useMemo(() => {
    const raw = agentDebugSnapshot?.recentErrorMessage;
    if (!raw || raw.length === 0) {
      return null;
    }
    return shortenRecentAgentError(raw);
  }, [agentDebugSnapshot?.recentErrorMessage]);

  const renderStatusCard = ({
    title,
    body,
    tone = "default",
    actionLabel,
    onAction,
    actionDisabled = false,
  }: {
    title: string;
    body: string;
    tone?: StatusTone;
    actionLabel?: string;
    onAction?: () => void;
    actionDisabled?: boolean;
  }) => {
    return (
      <div
        className={[
          "chat-panel-mock__status-card",
          tone === "error" && "chat-panel-mock__status-card--error",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="chat-panel-mock__status-title">{title}</div>
        <div className="chat-panel-mock__status-body">{body}</div>
        {actionLabel && onAction ? (
          <button
            type="button"
            className="chat-panel-mock__status-action"
            onClick={onAction}
            disabled={actionDisabled}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    );
  };

  const renderBody = () => {
    if (sessionListError && sessions.length === 0) {
      return renderStatusCard({
        title: "Chat is unavailable",
        body: sessionListError,
        tone: "error",
        actionLabel: "Try again",
        onAction: () => {
          void refreshSessions();
        },
        actionDisabled: isLoadingSessions,
      });
    }

    if (isLoadingSession) {
      return renderStatusCard({
        title: "Loading chat",
        body: "Pulling the latest messages for this session.",
      });
    }

    if (!activeSessionId) {
      return renderStatusCard({
        title: "No chats yet",
        body: "Create a new chat to start the persisted conversation flow.",
        actionLabel: isCreatingSession ? "Creating..." : "New chat",
        onAction: () => {
          void handleCreateSession();
        },
        actionDisabled: isCreatingSession,
      });
    }

    if (sessionDetailError) {
      return renderStatusCard({
        title: "Couldn't open this chat",
        body: sessionDetailError,
        tone: "error",
        actionLabel: "Reload chat",
        onAction: () => {
          setSessionDetailError(null);
          setSessionLoadVersion((current) => current + 1);
        },
      });
    }

    if (!activeSession || activeSession.messages.length === 0) {
      return renderStatusCard({
        title: getSessionLabel(
          sessions.find((session) => session.id === activeSessionId) ?? {
            id: activeSessionId,
            title: null,
            lastMessageAt: new Date().toISOString(),
            messageCount: 0,
            preview: null,
          },
        ),
        body: "This session is ready. Send the first message to persist the conversation.",
      });
    }

    return (
      <>
        {activeSession.messages.map((message) => {
          const actions = getMessageActions(message);

          return (
            <ChatMessage
              key={message.id}
              role={getMessageRole(message.role)}
              actions={actions.map((action) => (
                <ChatMessageActionButton
                  key={`${message.id}-${action.id}`}
                  icon={action.icon}
                  label={action.label}
                />
              ))}
            >
              {message.content}
            </ChatMessage>
          );
        })}
        <div ref={logEndRef} />
      </>
    );
  };

  return (
    <div className="chat-panel-mock">
      {sessionListError && sessions.length > 0 ? (
        <div className="chat-panel-mock__notice" role="status">
          {sessionListError}
        </div>
      ) : null}

      <div className="chat-panel-mock__top-actions" role="toolbar" aria-label="Chat actions">
        <ChatToolbarActions
          onCreateSession={handleCreateSession}
          isCreatingSession={isCreatingSession}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
        />
      </div>

      <div className="chat-panel-mock__scroll">
        <div className="chat-panel-mock__messages" role="log" aria-live="polite" aria-relevant="additions">
          {isLoadingSessions && sessions.length === 0 ? (
            <div className="chat-panel-mock__status">Loading chat sessions…</div>
          ) : (
            renderBody()
          )}
        </div>
      </div>

      <div className="chat-panel-mock__composer-region">
        <AgentStatusStrip
          visible={SHOW_AGENT_INSTRUMENTATION_STRIP && (!!agentEnrichment || !!agentDebugSnapshot)}
          agentBlock={
            agentEnrichment ? (
              <span>
                <strong>agent:</strong> {agentEnrichment.kind === "ok" ? "ok" : "degraded"}
                {agentEnrichment.detail ? ` · ${agentEnrichment.detail}` : null}
                {agentLineFilesCount !== undefined ? ` · files: ${agentLineFilesCount}` : null}
                {agentLinePathHints.length > 0
                  ? ` · paths: ${agentLinePathHints.map(shortenPathForAgentStrip).join(", ")}`
                  : null}
                {agentEnrichment.kind === "degraded" && agentRecentErrorShort
                  ? ` · err: ${agentRecentErrorShort}`
                  : null}
              </span>
            ) : null
          }
          showSeparator={!!(agentEnrichment && agentDebugSnapshot)}
          stateBlock={
            agentDebugSnapshot ? (
              <span>
                <strong>state</strong> · plan:{" "}
                {agentDebugSnapshot.activePlan && agentDebugSnapshot.activePlan.length > 120
                  ? `${agentDebugSnapshot.activePlan.slice(0, 120)}…`
                  : agentDebugSnapshot.activePlan ?? "—"}{" "}
                · touched: {agentDebugSnapshot.touchedCount} · errors: {agentDebugSnapshot.errorCount}
                {!agentEnrichment && agentLinePathHints.length > 0
                  ? ` · paths: ${agentLinePathHints.map(shortenPathForAgentStrip).join(", ")}`
                  : null}
                {agentRecentErrorShort && agentEnrichment?.kind !== "degraded"
                  ? ` · err: ${agentRecentErrorShort}`
                  : null}
              </span>
            ) : null
          }
        />
        {sendError ? (
          <div className="chat-panel-mock__notice chat-panel-mock__notice--error" role="alert">
            {sendError}
          </div>
        ) : null}
        <ChatComposer
          disabled={isComposerDisabled}
          isSending={isSendingMessage}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
