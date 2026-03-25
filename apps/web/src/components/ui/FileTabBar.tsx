import type { ReactNode } from "react";

export type FileTabItem<T extends string = string> = {
  id: T;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  /** Deshabilita el tab y muestra el spinner compartido; solo usar con carga real. */
  loading?: boolean;
};

export type FileTabBarProps<T extends string> = {
  items: readonly FileTabItem<T>[];
  activeId: T;
  onSelect: (id: T) => void;
  onClose?: (id: T) => void;
};

export function FileTabBar<T extends string>({
  items,
  activeId,
  onSelect,
  onClose,
}: FileTabBarProps<T>) {
  return (
    <div className="file-tab-bar" role="tablist">
      {items.map((item) => {
        const isActive = item.id === activeId;
        const isBusy = item.loading === true;
        const isDisabled = item.disabled === true || isBusy;

        const tabClass = [
          "file-tab",
          isActive && "file-tab--active",
          isBusy && "file-tab--loading",
        ]
          .filter(Boolean)
          .join(" ");

        const tabButton = (
          <button
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-busy={isBusy || undefined}
            disabled={isDisabled}
            className={tabClass}
            onClick={() => {
              if (!isDisabled) onSelect(item.id);
            }}
          >
            {isBusy ? <span className="atlas-inline-spinner" aria-hidden /> : null}
            {item.icon ?? null}
            <span className="file-tab__label">{item.label}</span>
          </button>
        );

        if (!onClose) {
          return (
            <div key={item.id} className="file-tab-bar__pair" role="presentation">
              {tabButton}
            </div>
          );
        }

        return (
          <div key={item.id} className="file-tab-bar__pair" role="presentation">
            {tabButton}
            <button
              type="button"
              className="file-tab__close"
              aria-label={`Close ${item.label}`}
              disabled={isDisabled}
              onClick={(e) => {
                e.preventDefault();
                if (isDisabled) return;
                onClose(item.id);
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
