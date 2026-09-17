import type { MetadataRoute } from "next";
import { copy } from "@/lib/copy";

// What a phone reads when someone adds Bunting to their home screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: copy.brand,
    short_name: copy.brand,
    description: copy.landing.title,
    // Hosts land on their events. Signed out, that sends them to the landing page to sign in.
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F6EFE1",
    theme_color: "#BD5528",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      // Android crops icons to its own shape, so this one keeps the flags inside the safe centre.
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
