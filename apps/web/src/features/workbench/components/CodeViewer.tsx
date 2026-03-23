import type { CSSProperties } from "react";
import { useMemo } from "react";

const rootStyle: CSSProperties = {
  flex: "1 1 auto",
  minHeight: 0,
  overflow: "auto",
  padding: "var(--screen-content-padding) 0",
  fontFamily: "var(--font-family-mono)",
  fontSize: "var(--screen-font-size)",
  lineHeight: "var(--line-height-relaxed)",
  tabSize: 2,
};

const lineStyle: CSSProperties = {
  display: "flex",
  minHeight: 20,
  whiteSpace: "pre",
};

const gutterStyle: CSSProperties = {
  flexShrink: 0,
  width: 44,
  textAlign: "right",
  paddingRight: "var(--screen-gap)",
  color: "var(--screen-text-muted)",
  userSelect: "none",
};

const codeStyle: CSSProperties = {
  flex: "1 1 auto",
  color: "var(--screen-text-secondary)",
  paddingRight: "var(--screen-gap)",
};

type CodeViewerProps = {
  source: string;
};

export function CodeViewer({ source }: CodeViewerProps) {
  const lines = useMemo(() => source.split("\n"), [source]);

  return (
    <div style={rootStyle} aria-label="Code viewer">
      {lines.map((line, i) => (
        <div key={i} style={lineStyle}>
          <span style={gutterStyle}>{i + 1}</span>
          <span style={codeStyle}>{line}</span>
        </div>
      ))}
    </div>
  );
}
