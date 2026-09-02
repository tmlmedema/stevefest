import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Big_Shoulders, Anton, Archivo, Bitter } from "next/font/google";
import { BANDS } from "./lib/data";
import Nav from "./components/Nav";
import "./globals.css";

const shoulders = Big_Shoulders({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--f-shoulders",
  display: "swap",
});
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--f-anton",
  display: "swap",
});
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--f-archivo",
  display: "swap",
});
const bitter = Bitter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--f-bitter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Steve Fest II — Downtown Lombard, Sept 11–13 2026",
  description: `Steve Fest II at Shannon's Deli, 11 S Park Ave, Lombard IL. Three days, three stages, ${BANDS.length} bands. Free, all ages. Sept 11–13, 2026.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${shoulders.variable} ${anton.variable} ${archivo.variable} ${bitter.variable}`}
    >
      <body>
        <div className="page-shell">
          <Nav />
          <main>{children}</main>
          <div className="wrap">
            <footer>
              <span>
                <Image
                  className="footer-logo"
                  src="/assets/wordmark-nav.png"
                  alt="Steve Fest II"
                  width={760}
                  height={187}
                />
                Shannon&apos;s Deli · 11 S Park Ave, Lombard, IL 60148
              </span>
              <span>
                Sept 11–13, 2026 · Free · All ages ·{" "}
                <Link href="/privacy">Privacy</Link>
              </span>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
