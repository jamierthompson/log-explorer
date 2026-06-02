import type { Metadata } from "next";
import { JetBrains_Mono, Newsreader } from "next/font/google";

import { Footer } from "@/components/features/footer/footer";
import { ScrollToTop } from "@/components/features/scroll-to-top/scroll-to-top";

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

export const metadata: Metadata = {
  title: "Log Explorer",
  description:
    "A log explorer for browsing structured logs, with an adaptive shortcut legend.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${newsreader.variable}`}>
      <body>
        <a href="#main-content" className={styles.skipLink}>
          Skip to main content
        </a>
        {children}
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}
