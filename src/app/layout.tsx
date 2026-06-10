import type { Metadata } from "next";
import { JetBrains_Mono, Newsreader } from "next/font/google";

import { demoFont } from "@/demo/styles/fonts";
import "@/demo/styles/tokens.css";
import "@/site/styles/tokens.css";
import "./globals.css";
import styles from "./layout.module.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const SITE_NAME = "Log Explorer";
const SITE_TITLE = "Log Explorer — an incident, investigated in place";
const SITE_DESCRIPTION =
  "13:31 UTC: checkout starts returning 503s. Investigate a live incident in a log explorer that opens context in place — no new tab for every look, no scattered timeline — then read how it was built.";

// TODO: The Open Graph card has no URL or preview image until the site is
// deployed. Add `metadataBase` (or absolute URLs), `openGraph.url`, and a
// 1200×630 `openGraph.images` entry once the live URL and image exist —
// relative image paths fail the build unless `metadataBase` is set. A
// `twitter` block (card: "summary_large_image") can reuse the same image.
export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${newsreader.variable} ${demoFont.variable}`}
    >
      <body>
        <a href="#main-content" className={styles.skipLink}>
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
