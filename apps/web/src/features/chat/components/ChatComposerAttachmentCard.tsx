import { IconClose } from "../../../components/icons/ChatComposerIcons";
import { ChatBubble } from "./ChatBubble";
import type { ChatComposerAttachment } from "./ChatComposerAttachmentsRow";

type ChatComposerAttachmentCardProps = {
  attachment: ChatComposerAttachment;
  onRemove?: () => void;
};

function getAttachmentBadgeLabel(attachment: ChatComposerAttachment): string {
  if (attachment.isImage) return "IMG";

  const extension = attachment.name.split(".").pop()?.trim();
  if (!extension) return "FILE";

  return extension.slice(0, 4).toUpperCase();
}

/**
 * Tarjeta visual de adjunto del composer.
 * Conserva el DOM y las clases actuales para no abrir cambios de layout.
 */
export function ChatComposerAttachmentCard({
  attachment,
  onRemove,
}: ChatComposerAttachmentCardProps) {
  return (
    <ChatBubble
      role="user"
      kind={attachment.kind}
      className={[
        "chat-composer__attachment-card",
        attachment.isImage && "chat-composer__attachment-card--image",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="chat-composer__attachment-remove"
        aria-label={`Quitar ${attachment.name}`}
        onClick={onRemove}
      >
        <span className="chat-composer__attachment-remove-icon" aria-hidden>
          <IconClose />
        </span>
      </button>
      <div className="chat-composer__attachment-preview">
        {attachment.isImage && attachment.previewUrl ? (
          <img
            src={attachment.previewUrl}
            alt=""
            className="chat-composer__attachment-image"
          />
        ) : (
          <span className="chat-composer__attachment-badge" aria-hidden>
            {getAttachmentBadgeLabel(attachment)}
          </span>
        )}
      </div>
      {!attachment.isImage ? (
        <span className="chat-composer__attachment-name" title={attachment.name}>
          {attachment.name}
        </span>
      ) : null}
    </ChatBubble>
  );
}
