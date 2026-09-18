import type { RsvpInput } from "@/lib/guest/invite";

// One reading of the reply form, for both ways in. The personal link and the group link post the
// same field names, so they should not each have their own idea of what those fields mean.
function str(fd: FormData, k: string): string { return String(fd.get(k) ?? "").trim(); }
function num(fd: FormData, k: string): number | null {
  const raw = fd.get(k);
  if (raw === null || raw === "") return null;
  const v = Number(raw);
  return Number.isFinite(v) ? v : null;
}

export function answerFromForm(fd: FormData): RsvpInput | null {
  const status = str(fd, "status");
  if (status !== "yes" && status !== "no") return null;
  return {
    status,
    children: num(fd, "children"),
    adults: num(fd, "adults"),
    party_size: num(fd, "party_size"),
    party_names: str(fd, "party_names").split(/,|\n|\band\b|&/).map((s) => s.trim()).filter(Boolean),
    dietary: fd.getAll("dietary").map(String).filter(Boolean),
    dietary_note: str(fd, "dietary_note"),
    accessibility_note: str(fd, "accessibility_note"),
    custom_answer: str(fd, "custom_answer"),
    note: str(fd, "note"),
    emergency_name: str(fd, "emergency_name"),
    emergency_phone: str(fd, "emergency_phone"),
  };
}

export { str as formString };
