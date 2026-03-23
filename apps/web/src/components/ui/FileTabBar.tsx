import type { CSSProperties, ReactNode } from "react";

export type FileTabItem<T extends string = string> = {
  id: T;
  label: string;
  icon?: ReactNode;
};

export type FileTabBarProps<T extends string> = {
  items: readonly FileTabItem<T>[];
  activeId: T;
  onSelect: (id: T) => void;
  onClose?: (id: T) => void;
};

const barStyle: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  minHeight: 0,
  overflowX: "auto",
};

const tabStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--gap-sm)",
  padding: "var(--screen-header-padding-y) var(--screen-header-padding-x)",
  fontSize: "var(--screen-header-font-size)",
  fontWeight: "var(--font-weight-normal)",
  lineHeight: "var(--line-height-tight)",
  color: "var(--text-muted)",
  background: "transparent",
  border: "none",
  borderRight: "0.5px solid var(--screen-border)",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "color 120ms ease, background 120ms ease",
};

const tabActiveStyle: CSSProperties = {
  ...tabStyle,
  color: "var(--text-primary)",
  fontWeight: "var(--font-weight-medium)",
  background: "rgb(255 255 255 / 4%)",
};

const closeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 16,
  height: 16,
  padding: 0,
  margin: 0,
  fontSize: 12,
  lineHeight: 1,
  color: "inherit",
  opacity: 0.5,
  background: "transparent",
  border: "none",
  borderRadius: 3,
  cursor: "pointer",
};

export function FileTabBar<T extends string>({
  items,
  activeId,
  onSelect,
  onClose,
}: FileTabBarProps<T>) {
  return (
    <div style={barStyle} role="tablist">
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <div
            key={item.id}
            role="tab"
            aria-selected={isActive}
            style={isActive ? tabActiveStyle : tabStyle}
            onClick={() => onSelect(item.id)}
          >
            {item.icon ?? null}
            <span>{item.label}</span>
            {onClose ? (
              <button
                type="button"
                style={closeStyle}
                aria-label={`Close ${item.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(item.id);
                }}
              >
                ×
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
