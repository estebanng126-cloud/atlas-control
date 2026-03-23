import type { ChatSessionListItem } from "@atlas/types";

export type SessionRecencyGroup = "today" | "yesterday" | "week" | "older";

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return startOfLocalDay(a).getTime() === startOfLocalDay(b).getTime();
}

/** Agrupa por `lastMessageAt` (día local): hoy, ayer, últimos 7 días (excl. hoy/ayer), más antiguos. */
export function groupSessionsByRecency(
  sessions: readonly ChatSessionListItem[],
  now = new Date(),
): Record<SessionRecencyGroup, ChatSessionListItem[]> {
  const empty: Record<SessionRecencyGroup, ChatSessionListItem[]> = {
    today: [],
    yesterday: [],
    week: [],
    older: [],
  };

  const todayStart = startOfLocalDay(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  for (const session of sessions) {
    const d = new Date(session.lastMessageAt);
    const dayStart = startOfLocalDay(d);

    if (isSameLocalDay(d, now)) {
      empty.today.push(session);
      continue;
    }

    if (dayStart.getTime() === yesterdayStart.getTime()) {
      empty.yesterday.push(session);
      continue;
    }

    if (d >= weekStart) {
      empty.week.push(session);
      continue;
    }

    empty.older.push(session);
  }

  return empty;
}
