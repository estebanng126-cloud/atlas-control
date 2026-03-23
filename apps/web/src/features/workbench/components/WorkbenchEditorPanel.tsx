import { useState } from "react";
import { BasePanel } from "../../../components/ui/BasePanel";
import { WorkspaceTabBar, type WorkspaceTab } from "./WorkspaceTabBar";
import { CodeViewer } from "./CodeViewer";
import { workbenchPanelRootStyle } from "./workbenchPanelStyles";

const FILE_EXPLORER_SOURCE = `import type { CSSProperties, ReactNode } from "react";

const rootStyle: CSSProperties = {
  flex: "1 1 auto",
  minHeight: 0,
  overflow: "auto",
  padding: "var(--screen-content-padding) 0",
  fontSize: "var(--screen-font-size)",
  lineHeight: "var(--line-height-relaxed)",
  color: "var(--screen-text-secondary)",
  userSelect: "none",
};

const ROW_HEIGHT = 22;

function Row({
  depth,
  children,
  highlight,
}: {
  depth: number;
  children: ReactNode;
  highlight?: boolean;
}) {
  const style: CSSProperties = {
    height: ROW_HEIGHT,
    paddingLeft: 12 + depth * 16,
    paddingRight: 8,
    display: "flex",
    alignItems: "center",
    gap: "var(--gap-sm)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    background: highlight ? "rgb(255 255 255 / 6%)" : undefined,
  };
  return <div style={style}>{children}</div>;
}

function Chevron({ open }: { open?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        width: 16,
        flexShrink: 0,
        justifyContent: "center",
        fontSize: "var(--font-size-xs)",
        color: "var(--screen-text-muted)",
      }}
    >
      {open ? "\\u25BE" : "\\u25B8"}
    </span>
  );
}

function Spacer() {
  return <span style={{ display: "inline-block", width: 16, flexShrink: 0 }} />;
}

function Label({ children, bold }: { children: ReactNode; bold?: boolean }) {
  return (
    <span
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        fontWeight: bold
          ? "var(--font-weight-semibold)"
          : "var(--font-weight-normal)",
      }}
    >
      {children}
    </span>
  );
}

export function FileExplorer() {
  return (
    <div style={rootStyle}>
      <Row depth={0}>
        <Chevron open />
        <Label bold>ATLAS-CONTROL</Label>
      </Row>
      <Row depth={1}>
        <Chevron />
        <Label>.turbo</Label>
      </Row>
      <Row depth={1}>
        <Chevron open />
        <Label>apps</Label>
      </Row>
      {/* ... more rows ... */}
    </div>
  );
}`;

const AGENT_PANEL_SOURCE = `import { BasePanel } from "../../../components/ui/BasePanel";
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
}`;

const SOURCES: Record<WorkspaceTab, string> = {
  editor: FILE_EXPLORER_SOURCE,
  preview: AGENT_PANEL_SOURCE,
};

export function WorkbenchEditorPanel() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("editor");

  return (
    <BasePanel
      variant="plain"
      className="workbench-panel-group__surface"
      style={workbenchPanelRootStyle}
    >
      <WorkspaceTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <CodeViewer source={SOURCES[activeTab]} />
    </BasePanel>
  );
}
