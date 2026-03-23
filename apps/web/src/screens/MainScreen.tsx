import { AppShell } from "../shell/AppShell";
import { WorkbenchScreen } from "../features/workbench/WorkbenchScreen";
import "../styles/main-screen.css";

export function MainScreen() {
  return (
    <div className="main-screen">
      <AppShell>
        <WorkbenchScreen />
      </AppShell>
    </div>
  );
}
