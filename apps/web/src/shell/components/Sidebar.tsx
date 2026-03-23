/**
 * Sidebar — componente compuesto por composición.
 *
 * Chrome (marca, toggle, búsqueda opcional) + `.sidebar-content` (región principal `flex:1`:
 * UserCard, `.sidebar-nav-region`, spacer que estira), luego `.sidebar-footer-slot` al fondo.
 * Contenido del sidebar: región nav con clases propias (`.sidebar-nav-region`).
 */
import { useState } from "react";
import type { ReactNode } from "react";
import { SearchInput } from "../../components/ui/SearchInput";
import { AsideShell } from "../../components/ui/AsideShell";
import type { UserCardProps } from "../../features/sidebar/components/UserCard";
import { UserCard } from "../../features/sidebar/components/UserCard";
import { SidebarLayoutContext } from "./SidebarLayoutContext";
import { SidebarToggleButton } from "./SidebarToggleButton";

type SidebarProps = {
  showSearch?: boolean;
  /** Props del perfil encima del nav; por defecto demo tipo consola */
  userCardProps?: Partial<UserCardProps>;
  children?: ReactNode;
};

export function Sidebar({ showSearch = false, userCardProps, children }: SidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleRow = (
    <>
      {isSidebarOpen ? (
        <div className="sidebar-above-close-container">
          <span className="sidebar-brand-name">Atlas Center</span>
        </div>
      ) : null}
      <SidebarToggleButton
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((v) => !v)}
      />
    </>
  );

  return (
    <SidebarLayoutContext.Provider value={{ isOpen: isSidebarOpen }}>
      <AsideShell
        isOpen={isSidebarOpen}
        toggleButton={toggleRow}
        className="sidebar"
        closedClassName="sidebar--closed"
      >
        {isSidebarOpen ? <div className="sidebar-divider" /> : null}
        {isSidebarOpen && showSearch ? <SearchInput /> : null}
        <div className="sidebar-content">
          {isSidebarOpen ? (
            <UserCard name="FizzyRook" {...userCardProps} />
          ) : null}
          {children != null ? (
            <div className="sidebar-nav-region">{children}</div>
          ) : null}
          <div className="sidebar-main-spacer" aria-hidden />
        </div>
        {isSidebarOpen ? (
          <div
            className="sidebar-footer-slot"
            aria-label="Footer sidebar (vacío)"
            role="region"
          />
        ) : null}
      </AsideShell>
    </SidebarLayoutContext.Provider>
  );
}
