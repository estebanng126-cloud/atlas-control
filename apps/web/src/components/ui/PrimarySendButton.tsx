import type { ButtonHTMLAttributes } from "react";
import { IconSend } from "../icons/ChatComposerIcons";

export type PrimarySendButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  "aria-label"?: string;
};

/**
 * Acción primaria del composer del chat.
 * Mantiene una API simple: click claro y estado disabled.
 */
export function PrimarySendButton({
  "aria-label": ariaLabel = "Send message",
  className = "",
  type = "button",
  ...props
}: PrimarySendButtonProps) {
  const classes = ["primary-send-button", className].filter(Boolean).join(" ");

  return (
    <button type={type} className={classes} aria-label={ariaLabel} {...props}>
      <span className="primary-send-button__icon" aria-hidden>
        <IconSend />
      </span>
    </button>
  );
}
