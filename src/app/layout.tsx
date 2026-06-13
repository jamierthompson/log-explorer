import type { Metadata } from "next";
import { JetBrains_Mono, Newsreader } from "next/font/google";

import { demoFont } from "@/demo";
import "@/site/styles/tokens.css";
import "@/site/styles/base.css";
import { DemoStateProvider } from "@/site/features/experience/demo-state";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@/site/lib/site-meta";
import { SiteShell } from "@/site/shell/site-shell/site-shell";
import { SkipLink } from "@/site/shell/skip-link/skip-link";

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
  metadataBase: new URL("https://log-explorer.onrender.com"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    url: "/",
    type: "website",
    locale: "en_US",
  },
  // The preview image itself is the file-convention sibling of this
  // layout; the card type is all that needs declaring here.
  twitter: {
    card: "summary_large_image",
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
        <SkipLink />
        <DemoStateProvider>
          <SiteShell>{children}</SiteShell>
        </DemoStateProvider>
      </body>
    </html>
  );
}
