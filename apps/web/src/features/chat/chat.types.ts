export type ChatRole = "user" | "assistant";

export type ChatMessageKind = "text" | "pasted-text" | "image" | "file" | "code";

export type ChatAttachmentKind = Extract<ChatMessageKind, "image" | "file">;
