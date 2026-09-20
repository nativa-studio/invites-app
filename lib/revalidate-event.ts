import { revalidatePath } from "next/cache";

// Every screen of an event, revalidated together.
//
// One list, because an event's tabs read the same rows from different angles: adding a guest
// changes the list and the counts above it. Revalidating only the screen an action was called
// from left the others showing yesterday's numbers until a hard refresh, which is the kind of
// thing a host reads as the app having lost their guest.
export const EVENT_TABS = ["", "/look", "/guests", "/message", "/potluck", "/gift"] as const;

export function revalidateEvent(eventId: string) {
  for (const tab of EVENT_TABS) revalidatePath(`/app/events/${eventId}${tab}`);
}
