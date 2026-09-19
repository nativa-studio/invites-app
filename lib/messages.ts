import { copy } from "@/lib/copy";
import { firstName, formatShortDate, normalisePhone } from "@/lib/format";

export type TemplateEvent = { title: string; date: string | null; text_template?: string | null; reminder_template?: string | null };
export type TemplateGuest = { name: string; contact_name?: string | null };

// A placeholder, in whichever brackets the host reached for.
//
// The hint above the box says {name}, and a host writing their own wording types (name) about as
// often. A message went out reading "Hi (name), we'd love to know if you can celebrate Gabe's
// birthday with us", to a real guest, because a round bracket is not a curly one. Round, square
// and doubled brackets all mean the same thing here, and the spaces inside them are allowed too.
const TOKEN = /[{([]{1,2}\s*(name|title|date|link)\s*[})\]]{1,2}/gi;

// {name} is the guest the invite is for, never the person whose phone it lands on.
export function fillTemplate(template: string, e: TemplateEvent, g: TemplateGuest, link: string): string {
  const values: Record<string, string> = {
    name: firstName(g.name) || "there",
    title: e.title,
    date: e.date ? ` on ${formatShortDate(e.date)}` : "",
    link,
  };
  // {date} carries its own " on ", so that "{title}{date}" reads as one sentence. Write
  // "{title} is {date}" instead and that space is doubled, so runs of spaces within a line are
  // collapsed. Line breaks are left exactly as the host typed them.
  const filled = template.replace(TOKEN, (_, key: string) => values[key.toLowerCase()]).replace(/[^\S\n]{2,}/g, " ");
  return withLink(filled, link);
}

// The link is the whole message. Without it a guest has a sentence about a party and no way to
// see it or reply, and the host has no idea, because the app did exactly what the template said.
//
// So the link is not left to the template. A template that asks for it gets it where it asked;
// one that does not gets it on the end. This is what a host means either way: nobody writes an
// invite text meaning to leave out the invite.
function withLink(text: string, link: string): string {
  if (!link || text.includes(link)) return text;
  const body = text.trimEnd();
  // On its own line. A template that ends in a full stop and then runs straight into a url reads
  // as one long sentence with an address stuck on the end of it, and the url wraps over three
  // lines of the bubble anyway. A break makes it a sentence, then a link. A template that places
  // {link} itself is untouched: this only ever appends one that was not written in.
  return body ? `${body}\n${link}` : link;
}

export function inviteText(e: TemplateEvent, g: TemplateGuest, link: string): string {
  return fillTemplate(e.text_template?.trim() || copy.templates.text, e, g, link);
}

// The same invite wording for a group link, which is not addressed to anybody.
//
// A group link goes into a chat that already has people in it, so {name} has nobody to resolve
// to. It greets the room instead. Everything else is the host's own template, so the group link
// and the personal ones say the same thing.
export function groupInviteText(e: TemplateEvent, link: string): string {
  return fillTemplate(e.text_template?.trim() || copy.templates.text, e, { name: copy.templates.groupGreeting }, link);
}

export function reminderText(e: TemplateEvent, g: TemplateGuest, link: string): string {
  return fillTemplate(e.reminder_template?.trim() || copy.templates.reminder, e, g, link);
}

// "sms:" links: iOS wants "&body=", Android wants "?body=". The "?&body=" form works on both.
export function smsLink(phone: string, body: string): string {
  return `sms:${normalisePhone(phone)}?&body=${encodeURIComponent(body)}`;
}

export function whatsappLink(phone: string, body: string): string {
  const digits = normalisePhone(phone).replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `61${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(body)}`;
}
