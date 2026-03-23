import { useEffect, useRef, useState, type ClipboardEventHandler } from "react";
import {
  ChatComposerAttachmentsRow,
  type ChatComposerAttachment,
} from "./ChatComposerAttachmentsRow";
import { ChatComposerActions } from "./ChatComposerActions";
import { ChatComposerInput } from "./ChatComposerInput";

function isObjectUrl(url: string | undefined): url is string {
  return typeof url === "string" && url.startsWith("blob:");
}

function buildComposerAttachments(files: readonly File[]): ChatComposerAttachment[] {
  return files.map((file, index) => {
    const kind = file.type.startsWith("image/") ? "image" : "file";
    const previewUrl = kind === "image" ? URL.createObjectURL(file) : undefined;

    return {
      id: `${file.name}-${file.lastModified}-${index}`,
      name: file.name,
      type: file.type,
      previewUrl,
      isImage: kind === "image",
      kind,
    } satisfies ChatComposerAttachment;
  });
}

function insertTextAtSelection(
  currentValue: string,
  insertedText: string,
  selectionStart: number,
  selectionEnd: number,
) {
  return `${currentValue.slice(0, selectionStart)}${insertedText}${currentValue.slice(selectionEnd)}`;
}

/**
 * Composer del chat: input de mensaje + acciones de modo.
 * Mantiene las clases existentes para no cambiar el layout visual actual.
 */
type ChatComposerProps = {
  initialValue?: string;
  initialAttachments?: readonly ChatComposerAttachment[];
  disabled?: boolean;
  isSending?: boolean;
  onSendMessage?: (content: string) => Promise<void> | void;
};

export function ChatComposer({
  initialValue = "",
  initialAttachments = [],
  disabled = false,
  isSending = false,
  onSendMessage,
}: ChatComposerProps) {
  const [attachments, setAttachments] = useState<ChatComposerAttachment[]>(() => [
    ...initialAttachments,
  ]);
  const [message, setMessage] = useState(initialValue);
  const attachmentsRef = useRef<ChatComposerAttachment[]>([]);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((attachment) => {
        if (isObjectUrl(attachment.previewUrl)) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
      });
    };
  }, []);

  const handleAddFiles = (files: readonly File[]) => {
    const nextAttachments = buildComposerAttachments(files);
    setAttachments((current) => [...current, ...nextAttachments]);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments((current) => {
      const attachmentToRemove = current.find((attachment) => attachment.id === attachmentId);
      if (isObjectUrl(attachmentToRemove?.previewUrl)) {
        URL.revokeObjectURL(attachmentToRemove.previewUrl);
      }

      return current.filter((attachment) => attachment.id !== attachmentId);
    });
  };

  const handleComposerPaste: ClipboardEventHandler<HTMLTextAreaElement> = (event) => {
    const clipboardFiles = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);

    if (clipboardFiles.length === 0) return;

    const pastedText = event.clipboardData.getData("text/plain");
    const { selectionStart, selectionEnd } = event.currentTarget;

    event.preventDefault();

    if (pastedText.length > 0) {
      setMessage((current) =>
        insertTextAtSelection(current, pastedText, selectionStart, selectionEnd),
      );
    }

    handleAddFiles(clipboardFiles);
  };

  const normalizedMessage = message.trim();
  const hasText = normalizedMessage.length > 0;
  const hasAttachments = attachments.length > 0;
  const canSend = !disabled && !isSending && hasText;
  const showAttachmentDraftNotice = hasAttachments && !hasText;

  const handleSend = async () => {
    if (disabled || isSending || !hasText) return;

    await onSendMessage?.(normalizedMessage);

    attachmentsRef.current.forEach((attachment) => {
      if (isObjectUrl(attachment.previewUrl)) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
    });

    attachmentsRef.current = [];
    setAttachments([]);
    setMessage("");
  };

  return (
    <div className="chat-panel-mock__composer">
      {attachments.length > 0 ? (
        <ChatComposerAttachmentsRow
          attachments={attachments}
          onRemoveAttachment={handleRemoveAttachment}
        />
      ) : null}
      <ChatComposerInput
        value={message}
        onChange={setMessage}
        onPaste={handleComposerPaste}
        disabled={disabled || isSending}
      />
      {showAttachmentDraftNotice ? (
        <div className="chat-composer__draft-notice" role="status">
          Los adjuntos aún no se envían en esta versión.
        </div>
      ) : null}
      <ChatComposerActions
        onAddFiles={handleAddFiles}
        canSend={canSend}
        onSend={() => {
          void handleSend();
        }}
        disabled={disabled || isSending}
      />
    </div>
  );
}
