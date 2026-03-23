import { useId, useState } from "react";
import type { ReactNode } from "react";
import { IconWindowClose, IconWindowMaximize, IconWindowMinimize } from "../../components/icons/WindowFrameIcons";
import { BasePanel } from "../../components/ui/BasePanel";
import { IconButton } from "../../components/ui/IconButton";
import { UnderlineTabList } from "../../components/ui/UnderlineTabList";
import type { TopBarTabId, TopBarTabItem } from "../topBar/topBarTabs.types";
import { defaultTopBarTabId } from "../topBar/topBarTabs.types";

type TopBarProps = {
  leftSlot?: ReactNode;
  centerSlot?: ReactNode;
  rightSlot?: ReactNode;
  moduleTitle: string;
  tabs?: readonly TopBarTabItem[];
  /** Solo modo no controlado: tab inicial. */
  defaultTab?: TopBarTabId;
  /** Modo controlado: tab actual. */
  activeTab?: TopBarTabId;
  onTabChange?: (id: TopBarTabId) => void;
  showTabs?: boolean;
  /** Si es false, la fila de tabs no repite el título del módulo (p. ej. ya va en el slot izquierdo). */
  showTabRowModuleHeading?: boolean;
};

type TopBarRowProps = {
  leftSlot?: ReactNode;
  centerSlot?: ReactNode;
  rightSlot?: ReactNode;
};

function TopBarRow({ leftSlot, centerSlot, rightSlot }: TopBarRowProps) {
  return (
    <div className="top-bar-row">
      <div className="top-bar-row-slots">
        <div className="top-bar-slot top-bar-slot--left">{leftSlot}</div>
        <div className="top-bar-slot top-bar-slot--center">{centerSlot}</div>
        <div className="top-bar-slot top-bar-slot--right">{rightSlot}</div>
      </div>

      <div className="window-controls" aria-label="Window controls">
        <IconButton aria-label="Minimize window" icon={<IconWindowMinimize />} />
        <IconButton aria-label="Maximize window" icon={<IconWindowMaximize />} />
        <IconButton variant="danger" aria-label="Close window" icon={<IconWindowClose />} />
      </div>
    </div>
  );
}

export function TopBar({
  leftSlot,
  centerSlot,
  rightSlot,
  moduleTitle,
  tabs = [],
  defaultTab = defaultTopBarTabId,
  activeTab: activeTabProp,
  onTabChange,
  showTabs = false,
  showTabRowModuleHeading = true,
}: TopBarProps) {
  const moduleTitleId = useId();
  const [internalTab, setInternalTab] = useState<TopBarTabId>(defaultTab);
  const isControlled = activeTabProp !== undefined;
  const activeTabId = isControlled ? activeTabProp : internalTab;

  const handleTabSelect = (id: TopBarTabId) => {
    if (!isControlled) setInternalTab(id);
    onTabChange?.(id);
  };

  const showTabRow = showTabs && tabs.length > 0;

  return (
    <BasePanel
      as="header"
      variant="plain"
      className={showTabRow ? "top-bar top-bar--tabs-visible" : "top-bar"}
    >
      <div className="top-bar-column">
        <TopBarRow leftSlot={leftSlot} centerSlot={centerSlot} rightSlot={rightSlot} />
        {showTabRow ? (
          <div className="top-bar-tabs-row">
            {showTabRowModuleHeading ? (
              <span className="top-bar-module-title" id={moduleTitleId}>
                {moduleTitle}
              </span>
            ) : null}
            <UnderlineTabList<TopBarTabId>
              items={tabs}
              activeId={activeTabId}
              onSelect={handleTabSelect}
              {...(showTabRowModuleHeading
                ? { ariaLabelledBy: moduleTitleId }
                : { ariaLabel: "Application tabs" })}
            />
          </div>
        ) : null}
      </div>
    </BasePanel>
  );
}

export type { TopBarTabId, TopBarTabItem };
