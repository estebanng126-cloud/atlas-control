import { useMemo, useState } from "react";
import type { ChatSessionListItem } from "@atlas/types";
import { IconEllipsis } from "../../../components/icons/ChatMessageActionIcons";
import { getSessionLabel } from "../sessionLabel";
import { groupSessionsByRecency, type SessionRecencyGroup } from "../groupSessionsByRecency";

const SECTION_LABELS: Record<SessionRecencyGroup, string> = {
  today: "Today",
  yesterday: "Yesterday",
  week: "Previous 7 days",
  older: "Older",
};

const SECTION_ORDER: SessionRecencyGroup[] = ["today", "yesterday", "week", "older"];

function filterSessions(
  sessions: readonly ChatSessionListItem[],
  query: string,
): ChatSessionListItem[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [...sessions];
  }

  return sessions.filter((s) => {
    const label = getSessionLabel(s).toLowerCase();
    const preview = (s.preview ?? "").toLowerCase();
    return label.includes(q) || preview.includes(q);
  });
}

function IconSessionCheck({ active }: { active: boolean }) {
  return (
    <span
      className={[
        "chat-history-panel__check",
        active ? "chat-history-panel__check--active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      {active ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  );
}

/** Icono secundario tipo “abrir / archivo” (trazo fino, alineado al shell). */
function IconPanelArchive() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

export type ChatHistoryDropdownPanelProps = {
  sessions: readonly ChatSessionListItem[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
};

/**
 * Contenido del panel de historial (mismo “flow” visual que otros dropdowns: `PanelSurface` + lista).
 * Búsqueda + secciones por fecha; filas con acciones al hover (stub).
 */
export function ChatHistoryDropdownPanel({
  sessions,
  activeSessionId,
  onSelectSession,
}: ChatHistoryDropdownPanelProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => filterSessions(sessions, query), [sessions, query]);
  const grouped = useMemo(() => groupSessionsByRecency(filtered), [filtered]);
  const hasAnySection = SECTION_ORDER.some((key) => grouped[key].length > 0);

  return (
    <div className="chat-history-panel">
      <div className="chat-history-panel__search-wrap">
        <input
          type="search"
          className="chat-history-panel__search"
          placeholder="Search chats…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search chats"
        />
      </div>

      <div className="chat-history-panel__scroll" role="listbox" aria-label="Chat sessions">
        {SECTION_ORDER.map((key) => {
          const list = grouped[key];
          if (list.length === 0) {
            return null;
          }

          return (
            <section key={key} className="chat-history-panel__section">
              <h3 className="chat-history-panel__section-title">{SECTION_LABELS[key]}</h3>
              <ul className="chat-history-panel__list">
                {list.map((session) => {
                  const active = session.id === activeSessionId;
                  const label = getSessionLabel(session);
                  return (
                    <li key={session.id} className="chat-history-panel__item">
                      <button
                        type="button"
                        className={[
                          "chat-history-panel__row",
                          active ? "chat-history-panel__row--active" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        role="option"
                        aria-selected={active}
                        onClick={() => onSelectSession(session.id)}
                      >
                        <IconSessionCheck active={active} />
                        <span className="chat-history-panel__row-label" title={label}>
                          {label}
                        </span>
                        <span className="chat-history-panel__row-actions">
                          <button
                            type="button"
                            className="chat-history-panel__icon-btn"
                            aria-label="More options"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <IconEllipsis />
                          </button>
                          <button
                            type="button"
                            className="chat-history-panel__icon-btn"
                            aria-label="Archive or open"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <IconPanelArchive />
                          </button>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        {!hasAnySection ? (
          <p className="chat-history-panel__empty">
            {sessions.length === 0 ? "No chats yet." : "No chats match your search."}
          </p>
        ) : null}
      </div>

      <button type="button" className="chat-history-panel__footer" disabled>
        <span className="chat-history-panel__footer-chevron" aria-hidden>
          ›
        </span>
        Archived
      </button>
    </div>
  );
}
