import type { Metadata, Viewport } from "next";
import { Lilita_One, Nunito, Patrick_Hand_SC } from "next/font/google";
import { copy } from "@/lib/copy";
import "./globals.css";

const display = Lilita_One({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const hand = Patrick_Hand_SC({ weight: "400", subsets: ["latin"], variable: "--font-hand" });
const body = Nunito({ subsets: ["latin"], variable: "--font-body" });

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
    <html lang="en-AU" className={`${display.variable} ${hand.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
