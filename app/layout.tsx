import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { getEvent } from "@/lib/airtable";
import { env } from "@/lib/env";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
});

const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export async function generateMetadata(): Promise<Metadata> {
  let title = "You're invited";
  let description = "Open the invite to see the details and let us know if you can make it.";
  let hasCover = false;
  try {
    const event = await getEvent();
    if (event) {
      title = event.title;
      description = event.intro || description;
      hasCover = Boolean(event.coverImageUrl);
    }
  } catch {
    // Metadata falls back to the defaults when Airtable isn't reachable.
  }
  return {
    ...(env.siteUrl ? { metadataBase: new URL(env.siteUrl) } : {}),
    title: { default: title, template: `%s · ${title}` },
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "website",
      ...(hasCover ? { images: [{ url: "/cover" }] } : {}),
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
