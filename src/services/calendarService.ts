import { storageService as localStorageService } from './storageService';

export type CalendarEventKind = 'event' | 'deadline';

export type CalendarEvent = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD (local)
  time: string | null; // HH:MM (local)
  kind: CalendarEventKind;
  reminder_enabled: boolean;
  reminder_minutes_before: number;
  created_at: string;
};

const getKey = (userId: string) => `calendar_events_${userId}`;

export async function getCalendarEvents(userId: string): Promise<CalendarEvent[]> {
  return localStorageService.get<CalendarEvent[]>(getKey(userId), []);
}

export async function addCalendarEvent(
  userId: string,
  input: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at'>,
): Promise<CalendarEvent> {
  const list = await getCalendarEvents(userId);
  const now = new Date().toISOString();
  const event: CalendarEvent = {
    ...input,
    user_id: userId,
    id: `cal_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    created_at: now,
  };
  localStorageService.set(getKey(userId), [event, ...list]);
  return event;
}

export async function deleteCalendarEvent(userId: string, eventId: string): Promise<void> {
  const list = await getCalendarEvents(userId);
  localStorageService.set(
    getKey(userId),
    list.filter((e) => e.id !== eventId),
  );
}

