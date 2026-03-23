import type { ButtonHTMLAttributes, ReactNode } from "react";
import { IconChevronDown, IconChevronUp } from "../icons/ChevronIcons";
import { PanelSurface } from "./PanelSurface";

export type DropdownButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Icono opcional a la izquierda del label */
  icon?: ReactNode;
  /** Texto del botón */
  label: string;
  /** true = abierto (chevron up), false = cerrado (chevron down) */
  isOpen?: boolean;
  /** Contenido del panel (layout con clases `dropdown-btn__*`). */
  children?: ReactNode;
  /** Panel arriba o abajo del trigger; el dropdown posee su propio panel. */
  placement?: "top" | "bottom";
  /** Override opcional del color de fondo del panel flotante. */
  panelBackgroundColor?: string;
};

/**
 * Botón tipo dropdown: icono opcional + label + chevron (arrow up/down según isOpen).
 * children se renderiza en el panel al abrir. Al hacer click el padre debe actualizar isOpen.
 */
export function DropdownButton({
  icon,
  label,
  isOpen = false,
  children,
  placement = "top",
  panelBackgroundColor,
  className = "",
  type = "button",
  ...props
}: DropdownButtonProps) {
  const btnClasses = ["dropdown-btn", className].filter(Boolean).join(" ");
  const panelClass = `dropdown-btn__panel dropdown-btn__panel--${placement}`;

  return (
    <div className="dropdown-btn-wrap">
      <button type={type} className={btnClasses} aria-expanded={isOpen} aria-haspopup="listbox" {...props}>
        {icon != null ? (
          <span className="dropdown-btn__icon" aria-hidden>
            {icon}
          </span>
        ) : null}
        <span className="dropdown-btn__label">{label}</span>
        <span className="dropdown-btn__chevron" aria-hidden>
          {isOpen ? <IconChevronUp /> : <IconChevronDown />}
        </span>
      </button>
      {isOpen && children != null ? (
        <PanelSurface
          className={panelClass}
          backgroundColor={panelBackgroundColor}
        >
          {children}
        </PanelSurface>
      ) : null}
    </div>
  );
}
