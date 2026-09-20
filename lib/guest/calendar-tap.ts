import { isValidToken } from "@/lib/tokens";
import { callGuestRpc } from "./rpc";

export { looksLikeAPerson } from "./is-a-person";

// Somebody tapped Add to calendar.
//
// Never allowed to break the thing it is measuring. A guest tapping this wants their calendar,
// not a stamp in a database, so every failure here is swallowed and the redirect or the download
// goes ahead regardless. A database without migration 0029 has no function to call, which is the
// same as nobody having tapped it.
export async function calendarTapped(token: string): Promise<void> {
  if (!isValidToken(token)) return;
  try {
    await callGuestRpc<null>("calendar_tapped", { p_token: token });
  } catch {
    // Measuring is not worth failing for.
  }
}
