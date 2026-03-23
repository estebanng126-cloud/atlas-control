import { useEffect, useRef, useState } from "react";
import type { ChatSessionListItem } from "@atlas/types";
import { IconAdd, IconMore } from "../../../components/icons/ChatComposerIcons";
import { IconHistory } from "../../../components/icons/UserCardActionIcons";
import { IconButton } from "../../../components/ui/IconButton";
import { PanelSurface } from "../../../components/ui/PanelSurface";
import { ChatHistoryDropdownPanel } from "./ChatHistoryDropdownPanel";

type ToolbarOpenMenu = "history" | null;

export type ChatToolbarActionsProps = {
  onCreateSession: () => void;
  isCreatingSession: boolean;
  sessions: readonly ChatSessionListItem[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onOpenMore?: () => void;
};

/**
 * Iconos de la barra superior del chat (+ / historial / más).
 * Historial: mismo flujo que `ChatComposerActions` (estado + click fuera + `PanelSurface`).
 */
export function ChatToolbarActions({
  onCreateSession,
  isCreatingSession,
  sessions,
  activeSessionId,
  onSelectSession,
  onOpenMore,
}: ChatToolbarActionsProps) {
  const [openMenu, setOpenMenu] = useState<ToolbarOpenMenu>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openMenu === null) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!toolbarRef.current) {
        return;
      }
      if (toolbarRef.current.contains(event.target as Node)) {
        return;
      }
      setOpenMenu(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [openMenu]);

  const handleSelectSession = (sessionId: string) => {
    onSelectSession(sessionId);
    setOpenMenu(null);
  };

  return (
    <div className="chat-toolbar-actions" ref={toolbarRef}>
      <IconButton
        type="button"
        aria-label="New chat"
        icon={<IconAdd />}
        disabled={isCreatingSession}
        onClick={() => {
          setOpenMenu(null);
          onCreateSession();
        }}
      />

      <div className="chat-toolbar-actions__anchor">
        <IconButton
          type="button"
          aria-label="Chat history"
          aria-haspopup="listbox"
          aria-expanded={openMenu === "history"}
          icon={<IconHistory />}
          onClick={() => {
            setOpenMenu((current) => (current === "history" ? null : "history"));
          }}
        />
        {openMenu === "history" ? (
          <PanelSurface className="chat-toolbar-actions__panel">
            <ChatHistoryDropdownPanel
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={handleSelectSession}
            />
          </PanelSurface>
        ) : null}
      </div>

      <IconButton
        type="button"
        aria-label="More actions"
        icon={<IconMore />}
        onClick={() => {
          setOpenMenu(null);
          onOpenMore?.();
        }}
      />
    </div>
  );
}
