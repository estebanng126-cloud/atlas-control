import type { ButtonHTMLAttributes, ReactNode } from "react";

function needsIconOnlyAriaLabel(
  iconOnly: boolean,
  ariaFromProps: ButtonHTMLAttributes<HTMLButtonElement>["aria-label"],
): boolean {
  if (!iconOnly) return false;
  if (ariaFromProps == null) return true;
  if (typeof ariaFromProps === "string") return ariaFromProps.trim() === "";
  return false;
}

export type SidebarNavButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type"
> & {
  /** Icono a la izquierda (trazo fino, ~20px) */
  icon: ReactNode;
  /** Texto visible (oculto visualmente si iconOnly; sigue en aria-label) */
  label: string;
  /** Ítem activo: fondo tipo Xbox (redondeado, semitransparente) */
  active?: boolean;
  /** Sidebar colapsado: solo icono centrado */
  iconOnly?: boolean;
};

/**
 * Fila de navegación lateral estilo Xbox: inactivo transparente; activo con highlight suave.
 */
export function SidebarNavButton({
  icon,
  label,
  active = false,
  iconOnly = false,
  className = "",
  ...props
}: SidebarNavButtonProps) {
  const classes = [
    "sidebar-nav-button",
    active && "sidebar-nav-button--active",
    iconOnly && "sidebar-nav-button--icon-only",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const ariaFromProps = props["aria-label"];
  const extraA11y =
    needsIconOnlyAriaLabel(iconOnly, ariaFromProps) ? { "aria-label": label } : {};

  return (
    <button
      type="button"
      className={classes}
      {...props}
      {...extraA11y}
    >
      <span className="sidebar-nav-button__icon">{icon}</span>
      <span className="sidebar-nav-button__label" aria-hidden={iconOnly || undefined}>
        {label}
      </span>
    </button>
  );
}
