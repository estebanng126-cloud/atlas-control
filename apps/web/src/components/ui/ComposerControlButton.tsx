import type { ButtonHTMLAttributes, ReactNode } from "react";
import { IconChevronDown, IconChevronUp } from "../icons/ChevronIcons";
import { PanelSurface } from "./PanelSurface";

export type ComposerControlButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  icon?: ReactNode;
  children?: ReactNode;
  trailing?: ReactNode;
  active?: boolean;
};

export function ComposerControlButton({
  icon,
  children,
  trailing,
  active = false,
  className = "",
  type = "button",
  ...props
}: ComposerControlButtonProps) {
  const classes = [
    "composer-control-button",
    active && "composer-control-button--active",
    children == null && "composer-control-button--icon-only",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {icon != null ? (
        <span className="composer-control-button__icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      {children != null ? (
        <span className="composer-control-button__label">{children}</span>
      ) : null}
      {trailing != null ? (
        <span className="composer-control-button__trailing" aria-hidden>
          {trailing}
        </span>
      ) : null}
    </button>
  );
}

export type ComposerControlDropdownButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  icon?: ReactNode;
  label: string;
  isOpen?: boolean;
  children?: ReactNode;
};

export function ComposerControlDropdownButton({
  icon,
  label,
  isOpen = false,
  children,
  className = "",
  type = "button",
  ...props
}: ComposerControlDropdownButtonProps) {
  return (
    <div className="composer-control-button-wrap">
      <ComposerControlButton
        type={type}
        className={className}
        icon={icon}
        active={isOpen}
        trailing={isOpen ? <IconChevronUp /> : <IconChevronDown />}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        {...props}
      >
        {label}
      </ComposerControlButton>
      {isOpen && children != null ? (
        <PanelSurface className="composer-control-button__panel composer-control-button__panel--top">
          {children}
        </PanelSurface>
      ) : null}
    </div>
  );
}
