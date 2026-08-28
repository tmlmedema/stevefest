"use server";

import { revalidatePath } from "next/cache";
import { auth, isAdmin } from "@/auth";
import { setStatus, recordUpload, type Status } from "../lib/db";

/*
 * Server actions are POST endpoints with a friendlier syntax — anyone can call
 * one, not just the page that renders the button. So each of these re-checks
 * the session itself rather than trusting that /admin was already gated.
 */
async function reviewer(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email;

  if (!isAdmin(email)) throw new Error("Not an admin.");
  return email as string;
}

export async function review(formData: FormData): Promise<void> {
  const who = await reviewer();

  const pathname = String(formData.get("pathname") ?? "");
  const status = String(formData.get("status") ?? "") as Status;

  if (!pathname) throw new Error("Missing pathname.");
  if (status !== "approved" && status !== "rejected" && status !== "pending") {
    throw new Error(`Not a verdict: ${status}`);
  }

  /* A photo that reached Blob storage but never got a row — the completion
     callback missed it — still needs to be reviewable, so make sure there's
     something to update. Existing rows are left alone by this. */
  const url = String(formData.get("url") ?? "");
  if (url) await recordUpload(pathname, url);

  await setStatus(pathname, status, who);

  revalidatePath("/admin");
  revalidatePath("/photos");
}
