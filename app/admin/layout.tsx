import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Steve Fest II",
  /* Keep the panel out of search results even though it's password-walled. */
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="view admin">
      <div className="wrap page-top">{children}</div>
    </section>
  );
}
