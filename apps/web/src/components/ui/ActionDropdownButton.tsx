import type { ButtonHTMLAttributes, ReactNode } from "react";
import { IconChevronDown, IconChevronUp } from "../icons/ChevronIcons";
import { PanelSurface } from "./PanelSurface";

export type ActionDropdownButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  icon?: ReactNode;
  label: string;
  isOpen?: boolean;
  children?: ReactNode;
};

/**
 * Trigger de menú/dropdown basado en la familia visual Action*.
 */
export function ActionDropdownButton({
  icon,
  label,
  isOpen = false,
  children,
  className = "",
  type = "button",
  ...props
}: ActionDropdownButtonProps) {
  const classes = [
    "action-button",
    "action-button--dropdown",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="action-button-wrap">
      <button
        type={type}
        className={classes}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        {...props}
      >
        {icon != null ? (
          <span className="action-button__icon" aria-hidden>
            {icon}
          </span>
        ) : null}
        <span className="action-button__label">{label}</span>
        <span className="action-button__caret" aria-hidden>
          {isOpen ? <IconChevronUp /> : <IconChevronDown />}
        </span>
      </button>
      {isOpen && children != null ? (
        <PanelSurface className="action-button__panel action-button__panel--top">
          {children}
        </PanelSurface>
      ) : null}
    </div>
  );
}
