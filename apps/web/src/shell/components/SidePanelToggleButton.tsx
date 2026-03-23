import { IconChevronLeft, IconChevronRight } from "../../components/icons/ChevronIcons";
import { IconButton } from "../../components/ui/IconButton";

type SidePanelToggleButtonProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function SidePanelToggleButton({ isOpen, onToggle }: SidePanelToggleButtonProps) {
  return (
    <IconButton
      aria-label={isOpen ? "Collapse side panel" : "Expand side panel"}
      icon={isOpen ? <IconChevronLeft /> : <IconChevronRight />}
      onClick={onToggle}
    />
  );
}
