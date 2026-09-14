import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

/*
 * Two gates, in order.
 *
 * 1. A password on the whole site anywhere that isn't production or a
 *    machine running `next dev` — i.e. Vercel preview deployments, so a
 *    branch URL that gets passed around doesn't read as the real thing.
 * 2. The one that was always here: /admin needs a signed-in allowlisted
 *    Google account, the sign-in page excepted or there'd be nowhere to
 *    sign in from.
 *
 * On Next 16 this file is what used to be called middleware.ts. There can
 * only be one of it, which is why the preview password lives here with the
 * admin gate rather than in a second file.
 */

/* Which environments are open. VERCEL_ENV is set by Vercel itself and is
   missing entirely when this runs on a laptop, so "not on Vercel" reads as
   local; `vercel dev` says "development" and counts as local too. Anything
   else — preview, or some future named environment — gets the password. */
function isOpenEnv(): boolean {
  const env = process.env.VERCEL_ENV;
  return !env || env === "production" || env === "development";
}

/* A 401 carrying WWW-Authenticate is what makes the browser put up its own
   username/password box; there's no page of ours involved. The body is only
   what shows if someone cancels out of that box. */
function askForPassword(): NextResponse {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Steve Fest preview", charset="UTF-8"',
      /* A cached 401 would keep asking after the password is turned off. */
      "Cache-Control": "no-store",
    },
  });
}

function hasPreviewPassword(req: NextRequest): boolean {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;
  /* Nothing to check an answer against. Stay shut rather than swing open:
     a preview with the variables unset should be unreachable, not public. */
  if (!user || !pass) return false;

  const header = req.headers.get("authorization");
  if (!header?.toLowerCase().startsWith("basic ")) return false;

  let decoded: string;
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    /* Not valid base64. That's a failed attempt, not a 500. */
    return false;
  }

  /* Split on the *first* colon only: a username can't contain one, a
     password very much can, and splitting on all of them quietly breaks
     every password with a colon in it. */
  const colon = decoded.indexOf(":");
  if (colon === -1) return false;

  return decoded.slice(0, colon) === user && decoded.slice(colon + 1) === pass;
}

/* `/admin` and anything under it except the sign-in page. The trailing
   anchor is what keeps `/administrator` from matching. */
const ADMIN = /^\/admin(?:\/(?!signin).*)?$/;

/* next-auth's `auth` is overloaded; handed a Request and an event it behaves
   as the middleware this file used to export directly. Calling it that way
   keeps the redirect-to-signin behaviour the `authorized` callback drives.
   Wrapping it instead — `auth((req) => …)` — would look tidier and quietly
   disable that redirect: with a wrapped function present, next-auth runs the
   function *instead of* acting on an unauthorized answer. */
const authProxy = auth as unknown as (
  req: NextRequest,
  event: NextFetchEvent,
) => Promise<Response>;

export async function proxy(req: NextRequest, event: NextFetchEvent) {
  if (!isOpenEnv() && !hasPreviewPassword(req)) return askForPassword();

  if (ADMIN.test(req.nextUrl.pathname)) return authProxy(req, event);

  return NextResponse.next();
}

export const config = {
  /* Everything, because the preview password is only worth anything if it
     covers whole pages rather than a handful of routes. Next's own build
     output is left out: those are hashed asset URLs, and running a gate on
     every one of them costs an invocation per file in production too. */
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
