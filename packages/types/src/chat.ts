export type ChatMessageRole = "USER" | "ASSISTANT" | "SYSTEM";

export interface ChatMessageDto {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
}

export interface ChatSessionListItem {
  id: string;
  title: string | null;
  lastMessageAt: string;
  preview: string | null;
  messageCount: number;
}

export interface ChatSessionDetail {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messages: ChatMessageDto[];
}

export interface CreateChatSessionInput {
  title?: string;
}

export interface CreateChatMessageInput {
  content: string;
}
