import { useLayoutEffect, useRef, type ClipboardEventHandler } from "react";

type ChatComposerInputProps = {
  value: string;
  onChange: (value: string) => void;
  onPaste?: ClipboardEventHandler<HTMLTextAreaElement>;
  disabled?: boolean;
};

/**
 * Área editable del composer: well visual + textarea auto-grow con tope.
 */
export function ChatComposerInput({
  value,
  onChange,
  onPaste,
  disabled = false,
}: ChatComposerInputProps) {
  const composerInputRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const input = composerInputRef.current;
    if (!input) return;

    const maxHeight = 200;
    input.style.height = "0px";
    const nextHeight = Math.min(input.scrollHeight, maxHeight);
    input.style.height = `${nextHeight}px`;
    input.style.overflowY = input.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value]);

  return (
    <textarea
      ref={composerInputRef}
      className="chat-panel-mock__input"
      placeholder="Escribe un mensaje…"
      aria-label="Campo de mensaje"
      rows={1}
      autoFocus
      disabled={disabled}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onPaste={onPaste}
    />
  );
}
