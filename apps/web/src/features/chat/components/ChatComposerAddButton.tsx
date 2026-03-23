import { useRef, type ButtonHTMLAttributes } from "react";
import {
  IconAdd,
  IconAttach,
  IconCreateImage,
  IconDeepResearch,
  IconMore,
  IconShoppingResearch,
  IconWebSearch,
} from "../../../components/icons/ChatComposerIcons";
import { ComposerControlButton } from "../../../components/ui/ComposerControlButton";
import { PanelSurface } from "../../../components/ui/PanelSurface";

type ChatComposerAddButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  isOpen?: boolean;
  onAddFiles: (files: readonly File[]) => void;
  onRequestClose?: () => void;
};

const ADD_MENU_ITEMS = [
  { id: "attach", label: "Add photos & files", icon: <IconAttach /> },
  { id: "create-image", label: "Create image", icon: <IconCreateImage /> },
  { id: "deep-research", label: "Deep research", icon: <IconDeepResearch /> },
  { id: "shopping-research", label: "Shopping research", icon: <IconShoppingResearch /> },
  { id: "web-search", label: "Web search", icon: <IconWebSearch /> },
  { id: "more", label: "More", icon: <IconMore />, trailing: ">" },
] as const;

/**
 * Botón add del composer del chat.
 */
export function ChatComposerAddButton(props: ChatComposerAddButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isOpen = false, onAddFiles, onClick, onRequestClose, ...buttonProps } = props;

  const handleAttachClick = () => {
    inputRef.current?.click();
    onRequestClose?.();
  };

  return (
    <div className="chat-composer__add-menu-wrap">
      <input
        ref={inputRef}
        type="file"
        className="chat-composer__attach-input"
        disabled={buttonProps.disabled}
        multiple
        accept="image/*,.pdf,.txt,.doc,.docx,.zip"
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) {
            onAddFiles(Array.from(event.target.files));
          }
          event.target.value = "";
        }}
      />
      <ComposerControlButton
        type="button"
        active={isOpen}
        aria-label="Agregar"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        icon={<IconAdd />}
        onClick={onClick}
        {...buttonProps}
      />
      {isOpen ? (
        <PanelSurface className="chat-composer__add-menu-panel">
          <div className="chat-composer__add-menu-list" role="menu">
            {ADD_MENU_ITEMS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={[
                  "chat-composer__add-menu-item",
                  index === 0 && "chat-composer__add-menu-item--primary",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="menuitem"
                onClick={item.id === "attach" ? handleAttachClick : undefined}
              >
                <span className="chat-composer__add-menu-item-icon" aria-hidden>
                  {item.icon}
                </span>
                <span className="chat-composer__add-menu-item-label">{item.label}</span>
                {"trailing" in item ? (
                  <span className="chat-composer__add-menu-item-trailing" aria-hidden>
                    {item.trailing}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </PanelSurface>
      ) : null}
    </div>
  );
}
