import type { ReactNode } from "react";
import { BasePanel } from "../components/ui/BasePanel";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-fullscreen-container">
      <div className="app-fullscreen-column">
        <BasePanel variant="plain" className="app-fullscreen-topbar">
          TopBar
        </BasePanel>
        <div className="app-fullscreen-body-row">{children}</div>
      </div>
    </div>
  );
}
