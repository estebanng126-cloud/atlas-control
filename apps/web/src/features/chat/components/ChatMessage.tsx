import type { ReactNode } from "react";
import type { ChatMessageKind, ChatRole } from "../chat.types";
import { ChatBubble } from "./ChatBubble";
import { ChatMessageActionsRow } from "./ChatMessageActionsRow";

type ChatMessageProps = {
  role: ChatRole;
  kind?: ChatMessageKind;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/**
 * Unidad estructural del mensaje.
 * Controla ancho y composición bubble + actions row sin aportar piel visual propia.
 */
export function ChatMessage({
  role,
  kind = "text",
  children,
  actions,
  className = "",
}: ChatMessageProps) {
  const classes = [
    "chat-message",
    `chat-message--${role}`,
    kind === "code" && "chat-message--code",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} data-chat-role={role} data-chat-kind={kind}>
      <ChatBubble role={role} kind={kind}>
        {children}
      </ChatBubble>
      {actions ? <ChatMessageActionsRow side={role}>{actions}</ChatMessageActionsRow> : null}
    </div>
  );
}
