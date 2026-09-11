import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/auth";
import { canUpload } from "../../lib/wall";
import { recordUpload } from "../../lib/db";
import { BAD_CODE_MESSAGE, photographerFor } from "../../lib/data";

/* wall/<timestamp>.jpg — no slashes or dots can sneak through \d+, so this
   also rules out traversal and uploads outside the wall/ prefix. */
const UPLOAD_PATH = /^wall\/\d+\.jpg$/;

/* The photographer code rides along on the upload as clientPayload. Reading
   it here is what lets an invalid one be refused before a file is ever
   written — the form checks too, but the form is the client's to edit.
   Returns the code exactly as PHOTOGRAPHERS spells it, so what's stored is
   canonical rather than however it was typed. */
function codeFrom(clientPayload: string | null): string | null {
  if (!clientPayload) return null;

  let raw: unknown;
  try {
    raw = (JSON.parse(clientPayload) as { code?: unknown }).code;
  } catch {
    throw new Error(BAD_CODE_MESSAGE);
  }

  /* Nothing typed in the field is the ordinary case, not a failure. */
  if (raw == null || raw === "") return null;
  if (typeof raw !== "string") throw new Error(BAD_CODE_MESSAGE);

  const photographer = photographerFor(raw);
  if (!photographer) throw new Error(BAD_CODE_MESSAGE);

  return photographer.code;
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  /* The gate. Hiding the button stops honest visitors; this stops the rest,
     because a signed token is the only way anything reaches Blob storage and
     this is the only place tokens are signed.

     Scoped to token requests on purpose: the other kind of POST here is
     Vercel's own upload-completed callback, which arrives server-to-server
     with no session cookie and would fail any check we made of it. */
  if (body.type === "blob.generate-client-token") {
    const session = await auth();

    if (!canUpload(isAdmin(session?.user?.email))) {
      return NextResponse.json(
        { error: "The photo wall isn't open for uploads right now." },
        { status: 403 }
      );
    }
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        /* handleUpload signs whatever pathname the client asks for — the
           options below can't rewrite it. Refusing is the only lever, so
           accept nothing but the exact shape PhotoGrid produces. */
        if (!UPLOAD_PATH.test(pathname)) {
          throw new Error("Invalid upload path.");
        }

        /* Throws on a code that isn't one, which refuses the token — so a
           bad code costs no upload at all. */
        const code = codeFrom(clientPayload);

        return {
          /* Carried through to onUploadCompleted, which has no other way of
             knowing what the uploader typed. */
          tokenPayload: JSON.stringify({ code }),
          /* The browser always re-encodes to JPEG before it gets here, so
             anything else is a client that skipped the compression step. */
          allowedContentTypes: ["image/jpeg"],
          addRandomSuffix: true,
          /* Compression aims for ~380 KB. This is the backstop, not the target. */
          maximumSizeInBytes: 5 * 1024 * 1024,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        /* Vercel calls this from its own servers once the file has landed.
           It's the authoritative record, but it can't reach a laptop, so on
           localhost it never fires and the browser's confirm below stands in.
           Both write the same row, and the insert ignores duplicates. */
        const code = tokenPayload
          ? ((JSON.parse(tokenPayload) as { code?: string | null }).code ?? null)
          : null;
        await recordUpload(blob.pathname, blob.url, "pending", code);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
