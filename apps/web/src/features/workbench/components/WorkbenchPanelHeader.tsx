import type { ReactNode } from "react";
import { workbenchPanelTitleHeaderStyle } from "./workbenchPanelStyles";

type WorkbenchPanelHeaderProps = {
  children: ReactNode;
};

/**
 * Header de título para paneles del workbench (no scrollea con el contenido).
 * Para tabs del mismo workbench usa `WorkbenchPanelTabHeader`.
 */
export function WorkbenchPanelHeader({ children }: WorkbenchPanelHeaderProps) {
  return <header style={workbenchPanelTitleHeaderStyle}>{children}</header>;
}
