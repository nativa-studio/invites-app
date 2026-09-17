import { copy } from "@/lib/copy";
import { firstName, formatShortDate, normalisePhone } from "@/lib/format";

export type TemplateEvent = { title: string; date: string | null; text_template?: string | null; reminder_template?: string | null };
export type TemplateGuest = { name: string; contact_name?: string | null };

// {name} is the guest the invite is for, never the person whose phone it lands on.
export function fillTemplate(template: string, e: TemplateEvent, g: TemplateGuest, link: string): string {
  const date = e.date ? ` on ${formatShortDate(e.date)}` : "";
  const name = firstName(g.name) || "there";
  return template.replaceAll("{name}", name).replaceAll("{title}", e.title).replaceAll("{date}", date).replaceAll("{link}", link);
}

export function inviteText(e: TemplateEvent, g: TemplateGuest, link: string): string {
  return fillTemplate(e.text_template?.trim() || copy.templates.text, e, g, link);
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
