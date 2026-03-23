import type { ChatAttachmentKind } from "../chat.types";
import { ChatComposerAttachmentCard } from "./ChatComposerAttachmentCard";

type ChatComposerAttachment = {
  id: string;
  name: string;
  type: string;
  previewUrl?: string;
  isImage: boolean;
  kind: ChatAttachmentKind;
};

type ChatComposerAttachmentsRowProps = {
  attachments: readonly ChatComposerAttachment[];
  onRemoveAttachment: (attachmentId: string) => void;
};

/**
 * Fila de adjuntos del composer: muestra previews compactas y permite añadir/quitar archivos.
 */
export function ChatComposerAttachmentsRow({
  attachments,
  onRemoveAttachment,
}: ChatComposerAttachmentsRowProps) {
  return (
    <div className="chat-composer__attachments-row">
      {attachments.map((attachment) => (
        <ChatComposerAttachmentCard
          key={attachment.id}
          attachment={attachment}
          onRemove={() => onRemoveAttachment(attachment.id)}
        />
      ))}
    </div>
  );
}

export type { ChatComposerAttachment };
