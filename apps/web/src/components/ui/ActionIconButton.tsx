import type { ReactNode } from "react";
import { ActionButton, type ActionButtonProps } from "./ActionButton";

export type ActionIconButtonProps = Omit<ActionButtonProps, "children" | "icon"> & {
  icon: ReactNode;
  "aria-label": string;
};

/**
 * Primitive visual para acciones solo-icono dentro del shell y composer.
 */
export function ActionIconButton({
  className = "",
  icon,
  ...props
}: ActionIconButtonProps) {
  const classes = ["action-button--icon", className].filter(Boolean).join(" ");

  return (
    <ActionButton
      {...props}
      className={classes}
      icon={icon}
    />
  );
}
