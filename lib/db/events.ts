import type { PublicEvent, RunsheetStop, Update } from "./types";

// A row straight from the events table is not what a layout reads.
//
// Two of the fields the layouts use are not columns at all: the guest RPC builds `runsheet` and
// `updates` by joining two other tables. Read the row directly, as the host's own preview does,
// and those come back undefined, which is enough to throw the whole page. Migration 0004's
// section columns are the other half: a database without them yet must read as "shown", never
// as "hidden", because an invite that lost its details to a missing column would be a bad day.
// 0006's order is the same story: absent means the default order, never no sections at all.
//
// So everything that renders a layout passes its event through here first.
export function eventForRender<T extends Partial<PublicEvent>>(
  e: T,
  extra?: { runsheet?: RunsheetStop[]; updates?: Update[] },
): T {
  return {
    ...e,
    show_details: e.show_details ?? true,
    show_runsheet: e.show_runsheet ?? true,
    show_good_to_know: e.show_good_to_know ?? true,
    show_after: e.show_after ?? true,
    section_order: e.section_order ?? [],
    runsheet: extra?.runsheet ?? e.runsheet ?? [],
    updates: extra?.updates ?? e.updates ?? [],
  };
}
