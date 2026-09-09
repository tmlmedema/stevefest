import { head } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/auth";
import { canUpload } from "../../../lib/wall";
import { recordUpload } from "../../../lib/db";
import { BAD_CODE_MESSAGE, photographerFor } from "../../../lib/data";

/*
 * The browser says "that upload finished" so the photo shows up for review
 * straight away — and so the flow works at all on localhost, which Vercel's
 * own completion callback can't reach.
 *
 * Nothing here trusts the browser beyond the pathname: the file has to really
 * exist in Blob storage before a row is written, so this can't be used to
 * stuff the queue with rows for files that were never uploaded. The
 * photographer code gets the same treatment — checked here on its own terms,
 * not taken on the word of the upload that preceded it.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();

  if (!canUpload(isAdmin(session?.user?.email))) {
    return NextResponse.json({ error: "Not open for uploads." }, { status: 403 });
  }

  const { pathname, code } = (await request.json()) as {
    pathname?: unknown;
    code?: unknown;
  };

  if (typeof pathname !== "string" || !/^wall\/\d+-[\w-]+\.jpg$/.test(pathname)) {
    return NextResponse.json({ error: "Bad pathname." }, { status: 400 });
  }

  /* Checked again here rather than trusted from the upload: this route can be
     called on its own, so it can't lean on the token step having vetted it.
     An empty field is fine — most uploads have no code. */
  let credited: string | null = null;
  if (code != null && code !== "") {
    const photographer = typeof code === "string" ? photographerFor(code) : null;
    if (!photographer) {
      return NextResponse.json({ error: BAD_CODE_MESSAGE }, { status: 400 });
    }
    /* Stored as PHOTOGRAPHERS spells it, not as it was typed. */
    credited = photographer.code;
  }

  try {
    /* The check that makes the rest of this safe. */
    const blob = await head(pathname, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    await recordUpload(blob.pathname, blob.url, "pending", credited);
  } catch {
    return NextResponse.json({ error: "No such upload." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
