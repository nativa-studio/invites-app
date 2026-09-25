import type { Metadata, Viewport } from "next";
import { Lilita_One, Luckiest_Guy, Nunito, Patrick_Hand_SC } from "next/font/google";
import { copy } from "@/lib/copy";
import "./globals.css";

const display = Lilita_One({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const hand = Patrick_Hand_SC({ weight: "400", subsets: ["latin"], variable: "--font-hand" });
const body = Nunito({ subsets: ["latin"], variable: "--font-body" });
// A fourth face, and a deliberate addition rather than a drift: the two Monsters designs set the
// event title in it and nothing else does. Kept out of every other layout on purpose, which is
// what makes it read as those designs' own voice rather than as the app's.
const title = Luckiest_Guy({ weight: "400", subsets: ["latin"], variable: "--font-title" });

export const metadata: Metadata = {
  title: { default: copy.brand, template: "%s" },
  description: copy.landing.title,
  robots: { index: false, follow: false },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  // Added to an iPhone home screen, it opens full screen with its own name.
  appleWebApp: { capable: true, title: copy.brand, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#BD5528",
  // The invite runs edge to edge, so the page needs the phone's safe areas.
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${display.variable} ${hand.variable} ${body.variable} ${title.variable}`}>
      <body>{children}</body>
    </html>
  );
}
