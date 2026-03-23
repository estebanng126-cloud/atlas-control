/**
 * Tabs del TopBar: ids estables (misma convención que sidebar nav).
 */

export type TopBarTabId =
  | "tab-1"
  | "tab-2"
  | "tab-3"
  | "tab-4"
  | "tab-5"
  | "tab-6";

export type TopBarTabItem = {
  id: TopBarTabId;
  label: string;
};

/** Default funcional explícito (no inferido del primer ítem). */
export const defaultTopBarTabId: TopBarTabId = "tab-1";

export const defaultTopBarTabs: readonly TopBarTabItem[] = [
  { id: "tab-1", label: "Tab 1" },
  { id: "tab-2", label: "Tab 2" },
  { id: "tab-3", label: "Tab 3" },
  { id: "tab-4", label: "Tab 4" },
  { id: "tab-5", label: "Tab 5" },
  { id: "tab-6", label: "Tab 6" },
] as const;
