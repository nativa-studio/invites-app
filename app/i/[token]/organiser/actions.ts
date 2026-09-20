"use server";
import { getGiftBoard, postGiftUpdate, saveGift, type GiftBoard } from "@/lib/guest/gift";
import { isValidToken } from "@/lib/tokens";
import { copy } from "@/lib/copy";

// Which form saved, not just that something did. The page is two forms and four cards long, and
// a single "Saved." at the foot of it appeared three screens below the button that caused it,
// which on a phone is the same as no confirmation at all.
export type BoardState = { board: GiftBoard | null; saved?: "save" | "update"; error?: string };

// The organiser's form and their update box, in one action, because they are one page and every
// path through it ends the same way: the board as the database has it.
export async function organiserAction(_prev: BoardState, fd: FormData): Promise<BoardState> {
  const token = String(fd.get("token") ?? "");
  const what = String(fd.get("what") ?? "");
  if (!isValidToken(token)) return { board: null, error: copy.gift.wrongLink };

  const text = (k: string) => {
    const v = String(fd.get(k) ?? "").trim();
    return v === "" ? null : v;
  };
  // Typed by a person: "$20", "20", "20.50". Anything that is not a number means not set, which
  // is a thing an organiser is allowed to leave alone.
  const money = (k: string) => {
    const raw = String(fd.get(k) ?? "").replace(/[^0-9.]/g, "");
    return raw === "" || Number.isNaN(Number(raw)) ? null : Number(raw);
  };

  try {
    if (what === "update") {
      return { board: await postGiftUpdate(token, String(fd.get("latest_update") ?? "")), saved: "update" };
    }
    return {
      board: await saveGift(token, {
        pay_details: text("pay_details"),
        pay_reference: text("pay_reference"),
        message: text("message"),
        suggested: money("suggested"),
        chip_in_by: text("chip_in_by"),
        surprise: fd.get("surprise") != null,
      }),
      saved: "save",
    };
  } catch (e) {
    const m = e instanceof Error ? e.message : "";
    return {
      board: await getGiftBoard(token).catch(() => null),
      error: /not the organiser/.test(m) ? copy.organiser.notYours
        : /unknown token/.test(m) ? copy.gift.wrongLink
        : copy.gift.failed,
    };
  }
}
