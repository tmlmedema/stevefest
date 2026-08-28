import { signIn } from "@/auth";

/* Auth.js hands back a reason in ?error= when a sign-in doesn't stick. */
const MESSAGES: Record<string, string> = {
  AccessDenied:
    "That Google account isn't on the admin list. Ask Chip to add it.",
  Configuration:
    "Google sign-in isn't configured properly. Check the server's OAuth keys.",
  Verification: "That sign-in link expired. Try again.",
};

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="signin">
      <p className="eyebrow">Steve Fest II</p>
      <h2 className="head">Admin</h2>
      <p className="lede">
        Sign in with the Google account that&apos;s on the admin list.
      </p>

      {error && (
        <p className="signin-error">
          {MESSAGES[error] ?? "Sign-in failed. Give it another go."}
        </p>
      )}

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/admin" });
        }}
      >
        <button type="submit" className="btn-google">
          Sign in with Google
        </button>
      </form>
    </div>
  );
}
