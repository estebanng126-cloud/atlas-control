/** Ids estables de ítems de navegación lateral a nivel producto. */
export const SidebarItemId = {
  Dashboard: "dashboard",
  Workbench: "workbench",
} as const;

export type SidebarItemId = (typeof SidebarItemId)[keyof typeof SidebarItemId];
