// Whether this request is a person tapping a button, or a chat app fetching the link to draw a
// preview card. A link pasted into WhatsApp is fetched by WhatsApp before any human sees it, and
// counting that as a tap would make the number worse than useless: it would say every guest added
// the party to their calendar the moment the invite was sent.
//
// Two signals, both sent by the browser itself and neither spoofable by accident:
//   Sec-Purpose: prefetch    the browser or a preview bot saying this is not a person
//   Sec-Fetch-Mode           present on every real navigation from a real browser
// Anything calling itself a bot is out as well. A request with no Sec-Fetch headers at all is an
// older browser or a curl, and is counted, because refusing everything unfamiliar would quietly
// undercount real guests on old phones.
export function looksLikeAPerson(headers: Headers): boolean {
  const purpose = `${headers.get("sec-purpose") ?? ""} ${headers.get("purpose") ?? ""}`.toLowerCase();
  if (purpose.includes("prefetch") || purpose.includes("preview")) return false;
  const mode = headers.get("sec-fetch-mode");
  if (mode && mode !== "navigate") return false;
  const ua = (headers.get("user-agent") ?? "").toLowerCase();
  if (!ua) return false;
  return !/bot|crawler|spider|preview|facebookexternalhit|whatsapp|slackbot|telegrambot|discordbot|embedly|curl|wget|python-requests|headlesschrome/.test(ua);
}
