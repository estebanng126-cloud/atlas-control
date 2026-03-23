import type { CSSProperties, ReactNode } from "react";

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
      {open ? "▾" : "▸"}
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
        fontWeight: bold ? "var(--font-weight-semibold)" : "var(--font-weight-normal)",
      }}
    >
      {children}
    </span>
  );
}

export function FileExplorer() {
  return (
    <div style={rootStyle}>
      {/* root */}
      <Row depth={0}>
        <Chevron open />
        <Label bold>ATLAS-CONTROL</Label>
      </Row>

      {/* .turbo */}
      <Row depth={1}>
        <Chevron />
        <Label>.turbo</Label>
      </Row>

      {/* apps (open) */}
      <Row depth={1}>
        <Chevron open />
        <Label>apps</Label>
      </Row>
      <Row depth={2}>
        <Chevron />
        <Label>api</Label>
      </Row>

      {/* web (open) */}
      <Row depth={2}>
        <Chevron open />
        <Label>web</Label>
      </Row>
      <Row depth={3}>
        <Chevron />
        <Label>.turbo</Label>
      </Row>
      <Row depth={3}>
        <Chevron />
        <Label>dist</Label>
      </Row>
      <Row depth={3}>
        <Chevron open />
        <Label>docs</Label>
      </Row>
      <Row depth={4}>
        <Spacer />
        <Label>sidebar.md</Label>
      </Row>
      <Row depth={4}>
        <Spacer />
        <Label>slot.md</Label>
      </Row>

      {/* node_modules (open, highlighted) */}
      <Row depth={3} highlight>
        <Chevron open />
        <Label>node_modules</Label>
      </Row>
      <Row depth={4}>
        <Chevron />
        <Label>.bin</Label>
      </Row>
      <Row depth={4}>
        <Chevron />
        <Label>.vite</Label>
      </Row>
      <Row depth={4}>
        <Chevron />
        <Label>@atlas</Label>
      </Row>
      <Row depth={4}>
        <Chevron />
        <Label>@types</Label>
      </Row>
      <Row depth={4}>
        <Chevron />
        <Label>@vitejs</Label>
      </Row>
      <Row depth={4}>
        <Chevron />
        <Label>react</Label>
      </Row>
      <Row depth={4}>
        <Chevron />
        <Label>react-dom</Label>
      </Row>
      <Row depth={4}>
        <Chevron />
        <Label>typescript</Label>
      </Row>
      <Row depth={4}>
        <Chevron />
        <Label>vite</Label>
      </Row>

      {/* src */}
      <Row depth={3}>
        <Chevron />
        <Label>src</Label>
      </Row>

      {/* web root files */}
      <Row depth={3}>
        <Spacer />
        <Label>.env.example</Label>
      </Row>
      <Row depth={3}>
        <Spacer />
        <Label>index.html</Label>
      </Row>
      <Row depth={3}>
        <Spacer />
        <Label>package.json</Label>
      </Row>
      <Row depth={3}>
        <Spacer />
        <Label>tsconfig.json</Label>
      </Row>
      <Row depth={3}>
        <Spacer />
        <Label>tsconfig.tsbuildinfo</Label>
      </Row>
      <Row depth={3}>
        <Spacer />
        <Label>vite.config.d.ts</Label>
      </Row>
      <Row depth={3}>
        <Spacer />
        <Label>vite.config.js</Label>
      </Row>
      <Row depth={3}>
        <Spacer />
        <Label>vite.config.ts</Label>
      </Row>

      {/* root level continued */}
      <Row depth={1}>
        <Chevron />
        <Label>docs</Label>
      </Row>
      <Row depth={1}>
        <Chevron />
        <Label>node_modules</Label>
      </Row>
      <Row depth={1}>
        <Chevron />
        <Label>packages</Label>
      </Row>
      <Row depth={1}>
        <Chevron />
        <Label>scripts</Label>
      </Row>

      {/* root files */}
      <Row depth={1}>
        <Spacer />
        <Label>.env.example</Label>
      </Row>
      <Row depth={1}>
        <Spacer />
        <Label>.gitignore</Label>
      </Row>
      <Row depth={1}>
        <Spacer />
        <Label>package.json</Label>
      </Row>
      <Row depth={1}>
        <Spacer />
        <Label>pnpm-lock.yaml</Label>
      </Row>
      <Row depth={1}>
        <Spacer />
        <Label>pnpm-workspace.yaml</Label>
      </Row>
      <Row depth={1}>
        <Spacer />
        <Label>tsconfig.base.json</Label>
      </Row>
      <Row depth={1}>
        <Spacer />
        <Label>turbo.json</Label>
      </Row>
    </div>
  );
}
