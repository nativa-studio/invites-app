import { callGuestRpc } from "./rpc";

export { looksLikeAPerson } from "./is-a-person";

// Somebody opened a group link.
//
// Never allowed to break the page it is measuring, the same rule the calendar tap follows: a
// guest opening an invite wants the invite, not a row in a table, so every failure is swallowed
// and the page renders regardless. A database without migration 0040 has no function to call,
// which is the same as nobody having opened it.
export async function groupLinkOpened(slug: string, group?: string | null): Promise<void> {
  try {
    await callGuestRpc<null>("group_link_opened", { p_slug: slug, p_group: group || null });
  } catch {
    // Measuring is not worth failing for.
  }
}
