import { BasePanel } from "../../../components/ui/BasePanel";
import { WorkbenchPanelHeader } from "./WorkbenchPanelHeader";
import { workbenchPanelBodyStyle, workbenchPanelRootStyle } from "./workbenchPanelStyles";

export function WorkbenchAgentPanel() {
  return (
    <BasePanel
      variant="plain"
      className="workbench-panel-group__surface"
      style={workbenchPanelRootStyle}
    >
      <WorkbenchPanelHeader>Output / Agent</WorkbenchPanelHeader>
      <div style={workbenchPanelBodyStyle} aria-label="Agent content" />
    </BasePanel>
  );
}
