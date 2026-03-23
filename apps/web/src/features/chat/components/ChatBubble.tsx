import type { ReactNode } from "react";
import type { ChatMessageKind, ChatRole } from "../chat.types";
import { PanelSurface } from "../../../components/ui/PanelSurface";

type ChatBubbleProps = {
  role: ChatRole;
  kind?: ChatMessageKind;
  children: ReactNode;
  className?: string;
};

/**
 * Cápsula visual del chat construida sobre `PanelSurface`.
 * La alineación del mensaje sigue viviendo fuera de esta pieza.
 */
export function ChatBubble({
  role,
  kind = "text",
  children,
  className = "",
}: ChatBubbleProps) {
  const classes = [
    "chat-bubble",
    `chat-bubble--${kind}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <PanelSurface className={classes} data-chat-role={role} data-chat-kind={kind}>
      {children}
    </PanelSurface>
  );
}

export type { ChatBubbleProps };
