import { BasePanel } from "../../../components/ui/BasePanel";
import { WorkbenchPanelHeader } from "./WorkbenchPanelHeader";
import { workbenchPanelBodyStyle, workbenchPanelRootStyle } from "./workbenchPanelStyles";

export function WorkbenchInspectorPanel() {
  return (
    <BasePanel
      variant="plain"
      className="workbench-panel-group__surface"
      style={workbenchPanelRootStyle}
    >
      <WorkbenchPanelHeader>Context / Inspector</WorkbenchPanelHeader>
      <div style={workbenchPanelBodyStyle} aria-label="Inspector content" />
    </BasePanel>
  );
}
