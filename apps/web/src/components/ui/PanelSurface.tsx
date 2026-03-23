import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

type PanelSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  backgroundColor?: string;
};

/**
 * Superficie visual reutilizable para paneles flotantes y cajas tipo menú/popover.
 * Permite override del fondo manteniendo el estilo base centralizado.
 */
export function PanelSurface({
  children,
  className = "",
  backgroundColor,
  style,
  ...props
}: PanelSurfaceProps) {
  const classes = ["panel-surface", className].filter(Boolean).join(" ");
  const composedStyle: CSSProperties = {
    ...style,
    ...(backgroundColor ? { "--panel-surface-bg": backgroundColor } : {}),
  } as CSSProperties;

  return (
    <div className={classes} style={composedStyle} {...props}>
      {children}
    </div>
  );
}
