"use server";
import { chipIn, getGift, unchip, type Gift, noteGiftTap } from "@/lib/guest/gift";
import { isValidToken } from "@/lib/tokens";
import { claimWish, type WishState } from "@/lib/guest/wishes";
import { copy } from "@/lib/copy";

export type GiftState = { gift: Gift | null; error?: string };

// One action for the block, the same shape as the plate: say what you meant, get the block back.
// The amount is optional and stays optional. A guest who ticks without saying how much has told
// the organiser the useful thing, which is that they are in.
export async function giftAction(_prev: GiftState, fd: FormData): Promise<GiftState> {
  const token = String(fd.get("token") ?? "");
  const what = String(fd.get("what") ?? "");
  if (!isValidToken(token)) return { gift: null, error: copy.gift.wrongLink };

  // Typed by a person on a phone: "$20", "20.00", "20 ", or nothing at all. Anything that is not
  // a number is treated as not saying, which is already a thing they are allowed to do.
  const raw = String(fd.get("amount") ?? "").replace(/[^0-9.]/g, "");
  const amount = raw === "" || Number.isNaN(Number(raw)) ? null : Number(raw);

  try {
    if (what === "chip") return { gift: await chipIn(token, amount) };
    if (what === "unchip") return { gift: await unchip(token) };
    return { gift: await getGift(token) };
  } catch (e) {
    const m = e instanceof Error ? e.message : "";
    return {
      gift: await getGift(token).catch(() => null),
      error: /not answered/.test(m) ? copy.gift.notAnswered
        : /unknown token/.test(m) ? copy.gift.wrongLink
        : copy.gift.failed,
    };
  }
}

// A tap on Ideas, Group gift or Chip in. Fire and forget: the client does not wait for it and
// there is nothing to show if it fails, which is why it returns nothing at all rather than a
// state the caller would have to hold.
export async function tapAction(token: string, what: "ideas" | "group" | "chip"): Promise<void> {
  await noteGiftTap(token, what);
}

// Crossing an idea off the list, or putting it back.
//
// It lives beside the gift actions because the wish list is part of the gifts block, and it
// answers the same way the plate does: with the state of the list rather than a yes to the tap.
// Two guests on the same invite is the normal case, not the exception, and the second one to
// reach for the scooter has to be told rather than believed.
export async function wishAction(token: string, item: string, on: boolean): Promise<WishState[] | null> {
  if (!isValidToken(token)) return null;
  try {
    return await claimWish(token, item, on);
  } catch {
    return null;
  }
}
