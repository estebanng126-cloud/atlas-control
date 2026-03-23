import type { ButtonHTMLAttributes, ReactNode } from "react";

type ChatMessageActionButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "aria-label"
> & {
  icon: ReactNode;
  label: string;
};

/**
 * Acción secundaria compacta para mensajes del chat.
 * Conserva el DOM y las clases existentes para no alterar el contrato visual.
 */
export function ChatMessageActionButton({
  icon,
  label,
  title,
  className = "",
  type = "button",
  ...props
}: ChatMessageActionButtonProps) {
  const classes = ["chat-message-action", className].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={classes}
      aria-label={label}
      title={title ?? label}
      {...props}
    >
      <span className="chat-message-action__icon" aria-hidden>
        {icon}
      </span>
    </button>
  );
}

export type { ChatMessageActionButtonProps };
