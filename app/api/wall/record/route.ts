import { head } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/auth";
import { canUpload } from "../../../lib/wall";
import { recordUpload } from "../../../lib/db";

/*
 * The browser says "that upload finished" so the photo shows up for review
 * straight away — and so the flow works at all on localhost, which Vercel's
 * own completion callback can't reach.
 *
 * Nothing here trusts the browser beyond the pathname: the file has to really
 * exist in Blob storage before a row is written, so this can't be used to
 * stuff the queue with rows for files that were never uploaded.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();

  if (!canUpload(isAdmin(session?.user?.email))) {
    return NextResponse.json({ error: "Not open for uploads." }, { status: 403 });
  }

  const { pathname } = (await request.json()) as { pathname?: unknown };

  if (typeof pathname !== "string" || !/^wall\/\d+-[\w-]+\.jpg$/.test(pathname)) {
    return NextResponse.json({ error: "Bad pathname." }, { status: 400 });
  }

  try {
    /* The check that makes the rest of this safe. */
    const blob = await head(pathname, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    await recordUpload(blob.pathname, blob.url);
  } catch {
    return NextResponse.json({ error: "No such upload." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
