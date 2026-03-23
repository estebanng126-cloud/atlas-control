import { IconChevronLeft, IconChevronRight } from "../../components/icons/ChevronIcons";
import { IconButton } from "../../components/ui/IconButton";

type SidebarToggleButtonProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function SidebarToggleButton({ isOpen, onToggle }: SidebarToggleButtonProps) {
  return (
    <IconButton
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      icon={isOpen ? <IconChevronLeft /> : <IconChevronRight />}
      onClick={onToggle}
    />
  );
}
