import type { PublicEvent } from "./types";

// The section switches arrived in migration 0004. Until a database carries them, the event
// comes back without those keys, and a missing switch must read as "shown", never as "hidden":
// an invite that lost its details because a column was not there yet would be a bad day.
export function withSectionDefaults<T extends Partial<Pick<PublicEvent, "show_details" | "show_runsheet" | "show_good_to_know" | "show_after">>>(e: T): T {
  return {
    ...e,
    show_details: e.show_details ?? true,
    show_runsheet: e.show_runsheet ?? true,
    show_good_to_know: e.show_good_to_know ?? true,
    show_after: e.show_after ?? true,
  };
}
