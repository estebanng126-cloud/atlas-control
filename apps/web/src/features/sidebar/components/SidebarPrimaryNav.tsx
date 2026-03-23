import { SidebarNavButton } from "../../../components/ui/SidebarNavButton";
import { useSidebarLayout } from "../../../shell/components/SidebarLayoutContext";
import type { SidebarItemId } from "../sidebarItemId";
import { sidebarItems } from "../sidebarItems";

type SidebarPrimaryNavProps = {
  activeItemId: SidebarItemId;
  onItemSelect?: (id: SidebarItemId) => void;
};

/** Nav principal del sidebar: renderiza el catálogo real del feature. */
export function SidebarPrimaryNav({
  activeItemId,
  onItemSelect,
}: SidebarPrimaryNavProps) {
  const { isOpen } = useSidebarLayout();

  return (
    <nav className="sidebar-nav" aria-label="Primary sidebar">
      {sidebarItems.map((item) => (
        <SidebarNavButton
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={activeItemId === item.id}
          iconOnly={!isOpen}
          onClick={() => onItemSelect?.(item.id)}
        />
      ))}
    </nav>
  );
}
