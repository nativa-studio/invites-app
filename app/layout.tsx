import type { Metadata } from "next";
import { Lilita_One, Nunito, Patrick_Hand_SC } from "next/font/google";
import "./globals.css";

const display = Lilita_One({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const hand = Patrick_Hand_SC({ weight: "400", subsets: ["latin"], variable: "--font-hand" });
const body = Nunito({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: "Bunting", template: "%s" },
  description: "Event invites you text. RSVPs that sort themselves.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${display.variable} ${hand.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
