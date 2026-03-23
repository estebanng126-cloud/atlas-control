import type { ReactNode } from "react";
import { BasePanel } from "./BasePanel";

type AsideShellProps = {
  isOpen: boolean;
  toggleButton: ReactNode;
  className?: string;
  closedClassName?: string;
  "aria-label"?: string;
  children?: ReactNode;
};

/**
 * Layout wrapper for lateral panels (sidebar, side panel).
 * Controls the shared structural pattern: height constraint, overflow,
 * flex column, toggle row and content region.
 *
 * Visual skin comes from `BasePanel`; feature content comes from `children`.
 */
export function AsideShell({
  isOpen,
  toggleButton,
  className = "",
  closedClassName = "",
  "aria-label": ariaLabel,
  children,
}: AsideShellProps) {
  const rootClasses = [
    "aside-shell",
    className,
    !isOpen && closedClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <BasePanel as="aside" aria-label={ariaLabel} className={rootClasses}>
      <div className="aside-shell__column">
        <div className="aside-shell__toggle-row">
          {toggleButton}
        </div>
        {isOpen ? (
          <div className="aside-shell__content">{children}</div>
        ) : null}
      </div>
    </BasePanel>
  );
}

export type { AsideShellProps };
