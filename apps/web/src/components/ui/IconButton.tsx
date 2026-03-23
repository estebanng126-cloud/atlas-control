import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Tamaño y trazo recomendados para iconos Lucide dentro de `IconButton`
 * (compacto, alineado con `--control-size`).
 */
export const iconButtonLucideDefaults = {
  size: 15,
  strokeWidth: 1.25,
} as const;

export type IconButtonShape = "rounded" | "square";

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** Icono decorativo; el botón debe exponer nombre accesible (`aria-label` / `aria-labelledby`) */
  icon: ReactNode;
  /** Hover destructivo (p. ej. cerrar / eliminar). */
  variant?: "default" | "danger";
  /**
   * Forma del hit area; el estilo sigue en `.icon-button` / `.icon-button--square` (centralizado en CSS).
   * Por defecto coincide con el resto de controles compactos del shell (`--radius-sm`).
   */
  shape?: IconButtonShape;
};

/**
 * Botón solo icono, tamaño fijo `--control-size`. Reutilizable en toolbars, paneles, listas, etc.
 */
export function IconButton({
  icon,
  variant = "default",
  shape = "rounded",
  className = "",
  type = "button",
  ...props
}: IconButtonProps) {
  const classes = [
    "icon-button",
    variant === "danger" && "icon-button--danger",
    shape === "square" && "icon-button--square",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {icon}
    </button>
  );
}
