import type { Metadata } from "next";
import { JetBrains_Mono, Newsreader } from "next/font/google";

import "@/demo/styles/tokens.css";
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
const SITE_DESCRIPTION =
  "A log explorer prototype for investigating an incident without losing your place.";

// TODO: The Open Graph card has no URL or preview image until the site is
// deployed. Add `metadataBase` (or absolute URLs), `openGraph.url`, and a
// 1200×630 `openGraph.images` entry once the live URL and image exist —
// relative image paths fail the build unless `metadataBase` is set. A
// `twitter` block (card: "summary_large_image") can reuse the same image.
export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
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
      className={`${jetbrainsMono.variable} ${newsreader.variable}`}
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
