import type { ReactNode } from "react";

type ChatMessageActionsRowProps = {
  children: ReactNode;
  className?: string;
  side?: "assistant" | "user";
};

/**
 * Fila ligera de acciones/contexto del mensaje.
 * Vive fuera de `ChatBubble` para no contaminar la cápsula visual del mensaje.
 */
export function ChatMessageActionsRow({
  children,
  className = "",
  side = "assistant",
}: ChatMessageActionsRowProps) {
  const classes = [
    "chat-message-actions-row",
    `chat-message-actions-row--${side}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>{children}</div>
  );
}

export type { ChatMessageActionsRowProps };
