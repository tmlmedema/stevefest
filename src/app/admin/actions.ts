"use server";

import { revalidatePath } from "next/cache";
import { auth, isAdmin } from "@/auth";
import { del } from "@vercel/blob";
import { setStatus, recordUpload, removeUpload, type Status } from "../lib/db";

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
  if (status !== "approved" && status !== "pending") {
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

/*
 * Rejecting throws the photo away: the file goes from Blob storage and the row
 * goes from the ledger. There is no undo, which is why the button asks first.
 *
 * Storage before ledger on purpose. If the delete fails the row stays, the
 * photo stays in the queue, and the admin can try again — the pair stay in
 * step. The other order could leave a file nobody can see or reach.
 */
export async function reject(formData: FormData): Promise<void> {
  await reviewer();

  const pathname = String(formData.get("pathname") ?? "");
  const url = String(formData.get("url") ?? "");

  if (!pathname || !url) throw new Error("Missing photo.");

  await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
  await removeUpload(pathname);

  revalidatePath("/admin");
  revalidatePath("/photos");
}
