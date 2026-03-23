import type { ReactNode } from "react";

type AgentStatusStripProps = {
  visible: boolean;
  agentBlock: ReactNode;
  showSeparator: boolean;
  stateBlock: ReactNode;
};

/**
 * Franja mínima de instrumentación del runtime del agente (solo presentación).
 * Los datos y el flag de visibilidad los resuelve el padre.
 */
export function AgentStatusStrip({
  visible,
  agentBlock,
  showSeparator,
  stateBlock,
}: AgentStatusStripProps) {
  if (!visible) {
    return null;
  }

  if (agentBlock == null && stateBlock == null) {
    return null;
  }

  return (
    <div
      className="chat-panel-mock__notice"
      role="status"
      aria-label="Agent runtime"
      style={{ fontSize: "11px", lineHeight: 1.35, opacity: 0.85 }}
    >
      {agentBlock}
      {showSeparator ? <span> · </span> : null}
      {stateBlock}
    </div>
  );
}
