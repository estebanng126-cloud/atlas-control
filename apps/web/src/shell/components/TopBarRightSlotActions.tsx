import { IconUserCardBell, IconUserCardCast } from "../../components/icons/UserCardActionIcons";
import { ActionIconButton } from "../../components/ui/ActionIconButton";

type TopBarRightSlotActionsProps = {
  ariaLabelCast?: string;
  ariaLabelNotifications?: string;
  onCastClick?: () => void;
  onNotificationsClick?: () => void;
};

/** Piloto Action* en shell: acciones reales del slot derecho, sin tocar navegación ni window chrome. */
export function TopBarRightSlotActions({
  ariaLabelCast = "Transmitir o conectar",
  ariaLabelNotifications = "Notificaciones",
  onCastClick,
  onNotificationsClick,
}: TopBarRightSlotActionsProps) {
  return (
    <div className="top-bar-right-slot-actions">
      <ActionIconButton
        type="button"
        aria-label={ariaLabelCast}
        icon={<IconUserCardCast />}
        onClick={onCastClick}
      />
      <ActionIconButton
        type="button"
        aria-label={ariaLabelNotifications}
        icon={<IconUserCardBell />}
        onClick={onNotificationsClick}
      />
    </div>
  );
}
