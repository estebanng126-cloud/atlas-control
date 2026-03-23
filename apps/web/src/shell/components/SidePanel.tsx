import { useState } from "react";
import type { ReactNode } from "react";
import { AsideShell } from "../../components/ui/AsideShell";
import { SidePanelToggleButton } from "./SidePanelToggleButton";

type SidePanelProps = {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  children?: ReactNode;
  title?: string;
  /** Nombre accesible del `aside` (panel lateral). */
  "aria-label"?: string;
};

/**
 * Región del panel lateral: chrome (toggle) + contenido para screens.
 * `children` = contenido del panel (chat, lista, inspector…).
 */
export function SidePanel({
  isOpen,
  onClose,
  onOpen,
  children,
  "aria-label": ariaLabel = "Columna lateral",
}: SidePanelProps) {
  const [internalOpen, setInternalOpen] = useState(true);
  const open = isOpen ?? internalOpen;

  const handleClose = () => {
    onClose?.();
    if (isOpen === undefined) setInternalOpen(false);
  };

  const handleOpen = () => {
    onOpen?.();
    if (isOpen === undefined) setInternalOpen(true);
  };

  const handleToggle = () => {
    if (open) {
      handleClose();
      return;
    }
    handleOpen();
  };

  return (
    <AsideShell
      isOpen={open}
      toggleButton={
        <SidePanelToggleButton isOpen={open} onToggle={handleToggle} />
      }
      className="side-panel"
      closedClassName="side-panel--closed"
      aria-label={ariaLabel}
    >
      <div className="side-panel-content">{children}</div>
    </AsideShell>
  );
}
