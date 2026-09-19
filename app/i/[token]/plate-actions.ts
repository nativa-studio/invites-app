"use server";
import { addPlateItem, claimPlateItem, getPlate, unclaimPlateItem, type Plate } from "@/lib/guest/plate";
import { isValidToken } from "@/lib/tokens";
import { copy } from "@/lib/copy";

export type PlateState = { plate: Plate | null; error?: string };

// One action for the whole board, because every tap on it does the same thing: say what you meant
// and get the board back. The reply is the board the database has, not the board the page drew
// while it waited, which is what makes two guests claiming the same dish come out right.
export async function plateAction(_prev: PlateState, fd: FormData): Promise<PlateState> {
  const token = String(fd.get("token") ?? "");
  const what = String(fd.get("what") ?? "");
  const item = String(fd.get("item") ?? "");
  const label = String(fd.get("label") ?? "");
  const tags = fd.getAll("tags").map(String);
  if (!isValidToken(token)) return { plate: null, error: copy.plate.wrongLink };

  try {
    if (what === "claim" && item) return { plate: await claimPlateItem(token, item) };
    if (what === "unclaim" && item) return { plate: await unclaimPlateItem(token, item) };
    if (what === "add") {
      if (!label.trim()) return { plate: await getPlate(token), error: copy.plate.needsName };
      return { plate: await addPlateItem(token, label, tags) };
    }
    return { plate: await getPlate(token) };
  } catch (e) {
    const m = e instanceof Error ? e.message : "";
    return {
      plate: await getPlate(token).catch(() => null),
      error: /too many/.test(m) ? copy.plate.tooMany
        : /not coming/.test(m) ? copy.plate.notComing
        : /unknown token/.test(m) ? copy.plate.wrongLink
        : copy.plate.failed,
    };
  }
}
