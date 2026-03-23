import { FileTabBar } from "../../../components/ui/FileTabBar";
import { WorkbenchPanelTabHeader } from "./WorkbenchPanelTabHeader";

export type WorkspaceTab = "editor" | "preview";

const TABS = [
  { id: "editor" as const, label: "FileExplorer.tsx" },
  { id: "preview" as const, label: "WorkbenchAgentPanel.tsx" },
];

type WorkspaceTabBarProps = {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
};

export function WorkspaceTabBar({ activeTab, onTabChange }: WorkspaceTabBarProps) {
  return (
    <WorkbenchPanelTabHeader>
      <FileTabBar<WorkspaceTab>
        items={TABS}
        activeId={activeTab}
        onSelect={onTabChange}
        onClose={() => {}}
      />
    </WorkbenchPanelTabHeader>
  );
}
