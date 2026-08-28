import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/auth";
import { canUpload } from "../../lib/wall";

/* wall/<timestamp>.jpg — no slashes or dots can sneak through \d+, so this
   also rules out traversal and uploads outside the wall/ prefix. */
const UPLOAD_PATH = /^wall\/\d+\.jpg$/;

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
      onBeforeGenerateToken: async (pathname) => {
        /* handleUpload signs whatever pathname the client asks for — the
           options below can't rewrite it. Refusing is the only lever, so
           accept nothing but the exact shape PhotoGrid produces. */
        if (!UPLOAD_PATH.test(pathname)) {
          throw new Error("Invalid upload path.");
        }

        return {
          /* The browser always re-encodes to JPEG before it gets here, so
             anything else is a client that skipped the compression step. */
          allowedContentTypes: ["image/jpeg"],
          addRandomSuffix: true,
          /* Compression aims for ~1.5 MB. This is the backstop, not the target. */
          maximumSizeInBytes: 5 * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {
        // Nothing to persist — Blob storage is the source of truth.
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
