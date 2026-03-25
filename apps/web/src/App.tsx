import { Component, type ErrorInfo, type ReactNode } from "react";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import { WorkbenchScreen } from "./features/workbench/WorkbenchScreen";
import {
  DesktopWorkbenchFilesystem,
  isDesktopWorkbenchBridgeAvailable,
} from "./features/workbench/filesystem/desktopWorkbenchFilesystem";
import { WorkbenchWorkspaceProvider } from "./features/workbench/state/WorkbenchWorkspaceContext";
import { WebWorkbenchFilesystem } from "./features/workbench/filesystem/webFilesystem";
import { DashboardScreen } from "./screens/DashboardScreen";
import { MainScreen } from "./screens/MainScreen";
import { ReportsScreen } from "./screens/ReportsScreen";

function createWorkbenchFilesystem() {
  if (isDesktopWorkbenchBridgeAvailable()) {
    return new DesktopWorkbenchFilesystem();
  }
  return new WebWorkbenchFilesystem();
}

/** `file://` dist loads break `BrowserRouter` path matching; hash routing keeps packaged Electron working. */
function AppRouter({ children }: { children: ReactNode }) {
  const useHash =
    typeof window !== "undefined" && window.location.protocol === "file:";
  const Router = useHash ? HashRouter : BrowserRouter;
  return <Router>{children}</Router>;
}

type AppErrorBoundaryState = { error: Error | null };

/** Surfaces React render errors instead of a blank shell (desktop / web). */
class AppErrorBoundary extends Component<{ children: ReactNode }, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AppErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            color: "rgb(28 28 32)",
            background: "rgb(250 250 252)",
            minHeight: "100vh",
            boxSizing: "border-box",
          }}
        >
          <h1 style={{ fontSize: 18, margin: "0 0 12px" }}>Atlas Control could not start</h1>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: 13,
              padding: 12,
              background: "rgb(255 255 255)",
              border: "1px solid rgb(200 200 210)",
              borderRadius: 8,
            }}
          >
            {this.state.error.message}
          </pre>
          <p style={{ fontSize: 13, color: "rgb(80 80 90)", marginTop: 16, maxWidth: 560 }}>
            Open DevTools (Console) for the full stack trace. In Electron with{" "}
            <code style={{ fontSize: 12 }}>dev:live</code>, also check the Network tab for failed script or CSS
            requests.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <AppErrorBoundary>
      <AppRouter>
        <WorkbenchWorkspaceProvider createFilesystem={createWorkbenchFilesystem}>
          <Routes>
            <Route path="/" element={<MainScreen />} />
            <Route path="/workbench" element={<WorkbenchScreen />} />
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/reports" element={<ReportsScreen />} />
          </Routes>
        </WorkbenchWorkspaceProvider>
      </AppRouter>
    </AppErrorBoundary>
  );
}

export default App;
