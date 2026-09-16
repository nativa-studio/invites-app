"use server";
import { redirect } from "next/navigation";
import { claimGroupLink } from "@/lib/guest/invite";

export type ClaimState = { error?: string };

export async function claimAction(_prev: ClaimState, fd: FormData): Promise<ClaimState> {
  const slug = String(fd.get("slug") ?? "");
  const name = String(fd.get("name") ?? "").trim();
  const phone = String(fd.get("phone") ?? "").trim();
  if (name.length < 2) return { error: "Please tell us your name." };
  let token: string;
  try {
    token = await claimGroupLink(slug, name, phone);
  } catch {
    return { error: "That didn't go through. Please try again." };
  }
  redirect(`/i/${token}`);
}
