import type { SidebarItemId } from "../../features/sidebar/sidebarItemId";
import { requireSidebarItem } from "../../features/sidebar/sidebarItems";
import type { TopBarTabId, TopBarTabItem } from "./topBarTabs.types";
import { defaultTopBarTabId, defaultTopBarTabs } from "./topBarTabs.types";

export type ResolvedTopBarState = {
  moduleTitle: string;
  showTabRow: boolean;
  tabs: readonly TopBarTabItem[];
  defaultTabId: TopBarTabId;
};

export function resolveTopBarState(moduleId: SidebarItemId): ResolvedTopBarState {
  const item = requireSidebarItem(moduleId);
  const showTabRow = item.showsTopBarTabRow === true;

  return {
    moduleTitle: item.label,
    showTabRow,
    tabs: showTabRow ? defaultTopBarTabs : [],
    defaultTabId: defaultTopBarTabId,
  };
}
