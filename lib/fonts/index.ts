import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

// The card images are drawn by Satori, which needs real font files rather than CSS. These sit
// in the repo and are read once per process. next.config keeps them in the deployment.
const DIR = path.join(process.cwd(), "lib", "fonts");

let cache: { name: string; data: Buffer; weight: 400 | 700; style: "normal" }[] | null = null;

export function cardFonts() {
  if (!cache) {
    cache = [
      { name: "Lilita One", data: readFileSync(path.join(DIR, "LilitaOne.ttf")), weight: 400, style: "normal" },
      { name: "Patrick Hand SC", data: readFileSync(path.join(DIR, "PatrickHandSC.ttf")), weight: 400, style: "normal" },
      { name: "Nunito", data: readFileSync(path.join(DIR, "Nunito-Bold.ttf")), weight: 700, style: "normal" },
    ];
  }
  return cache;
}
