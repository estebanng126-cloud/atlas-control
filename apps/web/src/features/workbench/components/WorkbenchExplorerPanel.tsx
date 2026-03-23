import { BasePanel } from "../../../components/ui/BasePanel";
import { FileExplorer } from "./FileExplorer";
import { WorkbenchPanelHeader } from "./WorkbenchPanelHeader";
import { workbenchPanelRootStyle } from "./workbenchPanelStyles";

export function WorkbenchExplorerPanel() {
  return (
    <BasePanel
      variant="plain"
      className="workbench-panel-group__surface"
      style={workbenchPanelRootStyle}
    >
      <WorkbenchPanelHeader>File Explorer</WorkbenchPanelHeader>
      <FileExplorer />
    </BasePanel>
  );
}
