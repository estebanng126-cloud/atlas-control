import { useEffect, useRef, useState } from "react";
import { IconAgent, IconAuto } from "../../../components/icons/ChatComposerIcons";
import {
  ComposerControlButton,
  ComposerControlDropdownButton,
} from "../../../components/ui/ComposerControlButton";
import { PrimarySendButton } from "../../../components/ui/PrimarySendButton";
import { ChatComposerAddButton } from "./ChatComposerAddButton";

const AGENT_OPTIONS = ["Agent", "Plan", "Debug", "Ask"] as const;
type ComposerOpenMenu = "add" | "agent" | null;

/**
 * Acciones inferiores del composer: selección de agente y modo.
 */
type ChatComposerActionsProps = {
  onAddFiles: (files: readonly File[]) => void;
  canSend: boolean;
  onSend: () => void;
  disabled?: boolean;
};

export function ChatComposerActions({
  onAddFiles,
  canSend,
  onSend,
  disabled = false,
}: ChatComposerActionsProps) {
  const [openMenu, setOpenMenu] = useState<ComposerOpenMenu>(null);
  const [isAutoEnabled, setIsAutoEnabled] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openMenu === null) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!actionsRef.current) return;
      if (actionsRef.current.contains(event.target as Node)) return;
      setOpenMenu(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [openMenu]);

  return (
    <div className="chat-composer__actions" ref={actionsRef}>
      <div className="chat-composer__controls-group">
        <ChatComposerAddButton
          disabled={disabled}
          isOpen={openMenu === "add"}
          onAddFiles={onAddFiles}
          onClick={() => setOpenMenu((current) => (current === "add" ? null : "add"))}
          onRequestClose={() => setOpenMenu(null)}
        />
        <ComposerControlDropdownButton
          icon={<IconAgent />}
          label="Agent"
          isOpen={openMenu === "agent"}
          aria-label="Seleccionar agente"
          disabled={disabled}
          onClick={() => {
            setOpenMenu((current) => (current === "agent" ? null : "agent"));
          }}
        >
          <div className="dropdown-btn__list">
            {AGENT_OPTIONS.map((option) => (
              <button key={option} type="button" className="dropdown-panel-tab">
                {option}
              </button>
            ))}
          </div>
        </ComposerControlDropdownButton>
        <ComposerControlButton
          type="button"
          icon={<IconAuto />}
          active={isAutoEnabled}
          aria-pressed={isAutoEnabled}
          aria-label="Modo Auto"
          disabled={disabled}
          onClick={() => {
            setIsAutoEnabled((current) => !current);
          }}
        >
          Auto
        </ComposerControlButton>
      </div>
      <div className="chat-composer__send-slot">
        <PrimarySendButton
          aria-label="Enviar mensaje"
          disabled={disabled || !canSend}
          onClick={() => {
            setOpenMenu(null);
            onSend();
          }}
        />
      </div>
    </div>
  );
}
