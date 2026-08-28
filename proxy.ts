export { auth as proxy } from "@/auth";

/*
 * Everything under /admin needs a signed-in allowlisted Google account. The
 * sign-in page itself is excluded, or there'd be nowhere to sign in from.
 */
export const config = {
  matcher: ["/admin", "/admin/((?!signin).*)"],
};
