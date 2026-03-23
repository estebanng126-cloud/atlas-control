import type { ReactNode } from "react";

type ScreenBackgroundProps = {
  children: ReactNode;
};

export function ScreenBackground({ children }: ScreenBackgroundProps) {
  return <div className="screen-background">{children}</div>;
}

