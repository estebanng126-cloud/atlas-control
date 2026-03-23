import type { ReactNode } from "react";
import { workbenchPanelHeaderStripStyle } from "./workbenchPanelStyles";

type WorkbenchPanelTabHeaderProps = {
  children: ReactNode;
};

/**
 * Header de fila de tabs (p. ej. Workspace). Misma línea visual que `WorkbenchPanelHeader`
 * (franja + borde), sin padding extra en el contenedor: cada tab aplica el suyo.
 */
export function WorkbenchPanelTabHeader({ children }: WorkbenchPanelTabHeaderProps) {
  return <header style={workbenchPanelHeaderStripStyle}>{children}</header>;
}
