import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ActionButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  icon?: ReactNode;
  children?: ReactNode;
};

/**
 * Cápsula interactiva base para la familia Action*.
 */
export function ActionButton({
  icon,
  children,
  className = "",
  type = "button",
  ...props
}: ActionButtonProps) {
  const classes = ["action-button", className].filter(Boolean).join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {icon != null ? (
        <span className="action-button__icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      {children != null ? <span className="action-button__label">{children}</span> : null}
    </button>
  );
}
