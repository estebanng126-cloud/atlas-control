import type { ChatSessionListItem } from "@atlas/types";

export function getSessionLabel(session: ChatSessionListItem): string {
  return session.title ?? "New chat";
}
