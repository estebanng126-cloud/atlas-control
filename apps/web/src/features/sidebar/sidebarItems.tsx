import type { ReactNode } from "react";
import { IconSidebarDashboard, IconSidebarWorkbench } from "../../components/icons/SidebarNavIcons";
import { SidebarItemId } from "./sidebarItemId";
import type { SidebarItemId as SidebarItemIdType } from "./sidebarItemId";

export type SidebarItem = {
  id: SidebarItemIdType;
  label: string;
  /** Icono de navegación principal del módulo. */
  icon: ReactNode;
  /** Metadata de shell: mostrar o no la segunda fila de tabs del top bar. */
  showsTopBarTabRow?: boolean;
};

export const defaultSidebarItemId: SidebarItemIdType = SidebarItemId.Dashboard;

export const sidebarItems: readonly SidebarItem[] = [
  {
    id: SidebarItemId.Dashboard,
    label: "Dashboard",
    icon: <IconSidebarDashboard />,
    showsTopBarTabRow: false,
  },
  {
    id: SidebarItemId.Workbench,
    label: "Workbench",
    icon: <IconSidebarWorkbench />,
    showsTopBarTabRow: false,
  },
];

export function getSidebarItem(id: SidebarItemIdType): SidebarItem | undefined {
  return sidebarItems.find((item) => item.id === id);
}

export function requireSidebarItem(id: SidebarItemIdType): SidebarItem {
  const item = getSidebarItem(id);
  if (!item) {
    throw new Error(`sidebar catalog must include item: ${id}`);
  }
  return item;
}
