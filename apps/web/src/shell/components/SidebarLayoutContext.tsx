import { createContext, useContext } from "react";

type SidebarLayoutValue = {
  /** true = ancho completo con etiquetas; false = rail estrecho, nav solo iconos */
  isOpen: boolean;
};

const defaultValue: SidebarLayoutValue = { isOpen: true };

export const SidebarLayoutContext = createContext<SidebarLayoutValue>(defaultValue);

export function useSidebarLayout(): SidebarLayoutValue {
  return useContext(SidebarLayoutContext);
}
