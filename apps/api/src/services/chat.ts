import { db } from "@atlas/db";
import type { ChatMessageDto, ChatSessionDetail, ChatSessionListItem } from "@atlas/types";
import { AiCompletionError, completeSimpleUserMessage } from "./ai";

const SESSION_TITLE_LIMIT = 60;
const SESSION_PREVIEW_LIMIT = 96;

function trimToNull(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function truncateText(value: string, limit: number): string {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}

function deriveSessionTitle(content: string): string {
  return truncateText(content, SESSION_TITLE_LIMIT);
}

function derivePreview(content: string): string {
  return truncateText(content, SESSION_PREVIEW_LIMIT);
}

function toMessageDto(message: {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
}): ChatMessageDto {
  return {
    id: message.id,
    role: message.role as ChatMessageDto["role"],
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };
}

export async function listChatSessions(): Promise<ChatSessionListItem[]> {
  const sessions = await db.chatSession.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          content: true,
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  return sessions.map((session) => ({
    id: session.id,
    title: session.title,
    lastMessageAt: session.lastMessageAt.toISOString(),
    preview: session.messages[0] ? derivePreview(session.messages[0].content) : null,
    messageCount: session._count.messages,
  }));
}

export async function createChatSession(input: { title?: string } = {}): Promise<ChatSessionDetail> {
  const title = trimToNull(input.title);

  const session = await db.chatSession.create({
    data: {
      ...(title ? { title } : {}),
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return {
    id: session.id,
    title: session.title,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    lastMessageAt: session.lastMessageAt.toISOString(),
    messages: session.messages.map(toMessageDto),
  };
}

export async function getChatSessionDetail(
  sessionId: string,
): Promise<ChatSessionDetail | null> {
  const session = await db.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!session) {
    return null;
  }

  return {
    id: session.id,
    title: session.title,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    lastMessageAt: session.lastMessageAt.toISOString(),
    messages: session.messages.map(toMessageDto),
  };
}

export type SendChatMessageResult =
  | { status: "success"; session: ChatSessionDetail }
  | { status: "not_found" }
  | { status: "ai_error"; message: string; statusCode: number };

export async function sendChatMessage(
  sessionId: string,
  content: string,
): Promise<SendChatMessageResult> {
  const normalizedContent = content.trim();

  if (!normalizedContent) {
    return { status: "not_found" };
  }

  const sessionExists = await db.chatSession.findUnique({
    where: { id: sessionId },
    select: { id: true },
  });

  if (!sessionExists) {
    return { status: "not_found" };
  }

  await db.$transaction(async (tx) => {
    const currentSession = await tx.chatSession.findUnique({
      where: { id: sessionId },
      select: {
        title: true,
      },
    });

    if (!currentSession) {
      return;
    }

    const nextTitle = currentSession.title ?? deriveSessionTitle(normalizedContent);

    const userMessage = await tx.chatMessage.create({
      data: {
        sessionId,
        role: "USER",
        content: normalizedContent,
      },
    });

    await tx.chatSession.update({
      where: { id: sessionId },
      data: {
        lastMessageAt: userMessage.createdAt,
        ...(currentSession.title ? {} : { title: nextTitle }),
      },
    });
  });

  let assistantContent: string;

  try {
    assistantContent = await completeSimpleUserMessage(normalizedContent);
  } catch (error) {
    if (error instanceof AiCompletionError) {
      return {
        status: "ai_error",
        message: error.message,
        statusCode: error.statusCode,
      };
    }

    return {
      status: "ai_error",
      message: "The assistant could not generate a reply. Please try again.",
      statusCode: 502,
    };
  }

  await db.$transaction(async (tx) => {
    const assistantMessage = await tx.chatMessage.create({
      data: {
        sessionId,
        role: "ASSISTANT",
        content: assistantContent,
      },
    });

    await tx.chatSession.update({
      where: { id: sessionId },
      data: {
        lastMessageAt: assistantMessage.createdAt,
      },
    });
  });

  const session = await getChatSessionDetail(sessionId);

  if (!session) {
    return { status: "not_found" };
  }

  return { status: "success", session };
}
