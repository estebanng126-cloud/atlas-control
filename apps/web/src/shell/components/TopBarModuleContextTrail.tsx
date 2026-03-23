import { IconChevronRight } from "../../components/icons/ChevronIcons";
import type { TopBarTabId, TopBarTabItem } from "../topBar/topBarTabs.types";

type TopBarModuleContextTrailProps = {
  /** Módulo / área actual resuelto desde la composición del shell. */
  moduleName: string;
  /**
   * Solo cuando el TopBar muestra fila de tabs: contexto “módulo > pestaña”.
   * Si no se pasa, solo se muestra el módulo (p. ej. Dashboard sin segunda fila).
   */
  tabContext?: {
    activeTabId: TopBarTabId;
    tabs: readonly TopBarTabItem[];
  };
};

/**
 * Contexto de módulo / pestaña en el top bar (`.top-bar-context-trail-wrap`).
 */
export function TopBarModuleContextTrail({
  moduleName,
  tabContext,
}: TopBarModuleContextTrailProps) {
  if (!tabContext || tabContext.tabs.length === 0) {
    return (
      <nav className="top-bar-context-trail-wrap" aria-label={moduleName}>
        <div className="top-bar-context-trail">
          <span className="top-bar-context-trail__module">{moduleName}</span>
        </div>
      </nav>
    );
  }

  const { activeTabId, tabs } = tabContext;
  const pageLabel = tabs.find((t) => t.id === activeTabId)?.label ?? activeTabId;

  return (
    <nav
      className="top-bar-context-trail-wrap"
      aria-label={`${moduleName}, ${pageLabel}`}
    >
      <div className="top-bar-context-trail">
        <span className="top-bar-context-trail__module">{moduleName}</span>
        <span className="top-bar-context-trail__sep" aria-hidden>
          <IconChevronRight />
        </span>
        <span className="top-bar-context-trail__page">{pageLabel}</span>
      </div>
    </nav>
  );
}
