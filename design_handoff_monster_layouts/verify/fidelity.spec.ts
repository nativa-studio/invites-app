/**
 * Fidelity suite for the Fur bands (`bands`) and Staff file (`file`) layouts.
 *
 * It compares the built pages with the approved design, measured: spec/golden.json and the PNGs in
 * reference/. Do not edit either, and do not loosen a tolerance to get a pass. See ACCEPTANCE.md.
 *
 *   FIXTURE_TOKEN   Mia's personal token on the zz-monsters fixture (README section 4)
 *   FIXTURE_SLUG    zz-monsters
 *   ROBUST_TOKEN    optional: a token on a copy of the fixture with the long name, a fifth note and the
 *                   runsheet off (ACCEPTANCE.md, Robustness). Skipped with a warning when unset.
 *   BASE_URL        http://localhost:3000, from `npm run build && npx next start`
 *
 * Needs dev dependencies: @playwright/test, pixelmatch, pngjs.
 */
import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const HERE = __dirname;
const ROOT = path.resolve(HERE, "..");
const OUT = path.join(HERE, "out");
fs.mkdirSync(OUT, { recursive: true });

const golden = JSON.parse(fs.readFileSync(path.join(ROOT, "spec/golden.json"), "utf8"));
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const TOKEN = process.env.FIXTURE_TOKEN ?? "";
const ROBUST = process.env.ROBUST_TOKEN ?? "";

const LAYOUTS = [
  { id: "bands", key: "1b Fur bands", open: "1b-bands-open-390.png", shut: "2a-bands-envelope-shut-390.png", shutKey: "2a Fur bands back", card: "2b-bands-share-card-1200x630.png" },
  { id: "file", key: "1c Staff file", open: "1c-file-open-390.png", shut: "2c-file-envelope-shut-390.png", shutKey: "2c Staff file back", card: "2d-file-share-card-1200x630.png" },
] as const;

type Box = { x: number; y: number; w: number; h: number };
const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;
const px = (v: string) => (v.endsWith("px") ? parseFloat(v) : v);

async function openInvite(page: Page, layout: string, token = TOKEN) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/i/${token}?layout=${layout}`);
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".stage .tap").click();
  await page.waitForSelector(".env-root.done", { timeout: 6000 });
  await page.waitForTimeout(300);
}

/** Everything the golden records, measured the same way from the built page. */
async function measure(page: Page) {
  return page.evaluate(() => {
    const main = document.querySelector(`main`) as HTMLElement;
    const M = main.getBoundingClientRect();
    const r = (n: number) => Math.round(n * 10) / 10;
    const box = (b: { left: number; top: number; width: number; height: number }, o: DOMRect = M) =>
      ({ x: r(b.left - o.left), y: r(b.top - o.top), w: r(b.width), h: r(b.height) });
    const texts: any[] = [];
    main.querySelectorAll("*").forEach((el) => {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") return;
      const nodes = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent!.trim());
      if (!nodes.length) return;
      let L = 1e9, T = 1e9, R = -1e9, B = -1e9;
      nodes.forEach((n) => { const rg = document.createRange(); rg.selectNodeContents(n); [...rg.getClientRects()].forEach((b) => { if (!b.width) return; L = Math.min(L, b.left); T = Math.min(T, b.top); R = Math.max(R, b.right); B = Math.max(B, b.bottom); }); });
      const sec = el.closest("[data-section]") as HTMLElement | null;
      const S = sec ? sec.getBoundingClientRect() : M;
      const tb = { left: L, top: T, width: R - L, height: B - T };
      texts.push({ text: nodes.map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim(), section: sec ? sec.dataset.section : "page", box: box(tb), sectionBox: box(tb, S),
        font: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), size: cs.fontSize, weight: cs.fontWeight, lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, transform: cs.textTransform, color: cs.color, align: cs.textAlign });
    });
    const sections = [...main.querySelectorAll("[data-section]")].map((el) => { const cs = getComputedStyle(el); return { section: (el as HTMLElement).dataset.section, nested: !!el.parentElement!.closest("[data-section]"), box: box(el.getBoundingClientRect()), background: cs.backgroundColor, backgroundImage: cs.backgroundImage === "none" ? undefined : cs.backgroundImage, padding: cs.padding }; });
    const controls = [...main.querySelectorAll("button, a")].filter((el) => getComputedStyle(el).display !== "none").map((el) => { const cs = getComputedStyle(el); const sec = el.closest("[data-section]") as HTMLElement | null; return { text: el.textContent!.replace(/\s+/g, " ").trim(), section: sec ? sec.dataset.section : "page", box: box(el.getBoundingClientRect()), background: cs.backgroundColor, backgroundImage: cs.backgroundImage === "none" ? undefined : cs.backgroundImage, color: cs.color, borderTop: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`, borderBottom: `${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor}`, radius: cs.borderRadius, shadow: cs.boxShadow === "none" ? undefined : cs.boxShadow, font: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), size: cs.fontSize }; });
    const images = [...main.querySelectorAll("img")].map((el) => { const cs = getComputedStyle(el); return { src: (el.currentSrc || el.src).split("/").pop()!.split("?")[0], box: box(el.getBoundingClientRect()), objectFit: cs.objectFit, objectPosition: cs.objectPosition }; });
    return { size: { w: main.offsetWidth, h: main.offsetHeight }, background: getComputedStyle(main).backgroundColor, sectionOrder: sections.map((s) => s.section), sections, texts, controls, images };
  });
}

function diffPng(actual: Buffer, refFile: string, outName: string, cropHeight?: number) {
  const ref = PNG.sync.read(fs.readFileSync(path.join(ROOT, "reference", refFile)));
  let act = PNG.sync.read(actual);
  const w = ref.width, h = cropHeight ?? Math.min(ref.height, act.height);
  const crop = (img: PNG) => { const o = new PNG({ width: w, height: h }); PNG.bitblt(img, o, 0, 0, w, h, 0, 0); return o; };
  const a = crop(act), b = crop(ref), d = new PNG({ width: w, height: h });
  const bad = pixelmatch(a.data, b.data, d.data, w, h, { threshold: 0.1 });
  fs.writeFileSync(path.join(OUT, outName), PNG.sync.write(d));
  fs.writeFileSync(path.join(OUT, outName.replace(".diff", ".built")), PNG.sync.write(a));
  return { ratio: bad / (w * h), refHeight: ref.height, actHeight: act.height };
}

for (const L of LAYOUTS) {
  const G = golden[L.key];

  test.describe(`${L.id}`, () => {
    test.skip(!TOKEN, "FIXTURE_TOKEN is not set");

    test(`${L.id} A: parts, order and data-section`, async ({ page }) => {
      await openInvite(page, L.id);
      const m = await measure(page);
      expect(m.sectionOrder, "section order").toEqual(G.sectionOrder);
      expect(m.sections.filter((s: any) => s.nested).map((s: any) => s.section), "nested data-section").toEqual([]);
    });

    test(`${L.id} B: sections`, async ({ page }) => {
      await openInvite(page, L.id);
      const m = await measure(page);
      const errors: string[] = [];
      for (const g of G.sections) {
        const s = m.sections.find((x: any) => x.section === g.section);
        if (!s) { errors.push(`missing section ${g.section}`); continue; }
        if (!near(s.box.x, g.box.x, 1) || !near(s.box.w, g.box.w, 1)) errors.push(`${g.section} box x/w ${s.box.x}/${s.box.w}, golden ${g.box.x}/${g.box.w}`);
        if (!near(s.box.h, g.box.h, 4)) errors.push(`${g.section} height ${s.box.h}, golden ${g.box.h}`);
        if (s.background !== g.background) errors.push(`${g.section} background ${s.background}, golden ${g.background}`);
        if ((s.backgroundImage ?? "") !== (g.backgroundImage ?? "")) errors.push(`${g.section} background-image differs:\n  built  ${s.backgroundImage}\n  golden ${g.backgroundImage}`);
        if (s.padding !== g.padding) errors.push(`${g.section} padding ${s.padding}, golden ${g.padding}`);
      }
      expect(errors, errors.join("\n")).toEqual([]);
    });

    test(`${L.id} C: every text, typography and position`, async ({ page }) => {
      await openInvite(page, L.id);
      const m = await measure(page);
      const errors: string[] = [];
      for (const g of G.texts) {
        const cands = m.texts.filter((t: any) => t.text === g.text && t.section === g.section);
        if (!cands.length) { errors.push(`MISSING in ${g.section}: "${g.text}"`); continue; }
        const t = cands.sort((a: any, b: any) => Math.abs(a.sectionBox.y - g.sectionBox.y) - Math.abs(b.sectionBox.y - g.sectionBox.y))[0];
        for (const k of ["font", "size", "weight", "lineHeight", "letterSpacing", "transform", "color", "align"] as const) {
          if (String(px(t[k])) !== String(px(g[k]))) errors.push(`"${g.text}" ${k}: built ${t[k]}, golden ${g[k]}`);
        }
        if (!near(t.sectionBox.x, g.sectionBox.x, 2) || !near(t.sectionBox.y, g.sectionBox.y, 3)) errors.push(`"${g.text}" position in ${g.section}: built ${t.sectionBox.x},${t.sectionBox.y}, golden ${g.sectionBox.x},${g.sectionBox.y}`);
        if (!near(t.sectionBox.w, g.sectionBox.w, 3)) errors.push(`"${g.text}" width: built ${t.sectionBox.w}, golden ${g.sectionBox.w}`);
      }
      expect(errors, errors.join("\n")).toEqual([]);
    });

    test(`${L.id} D: buttons and links`, async ({ page }) => {
      await openInvite(page, L.id);
      const m = await measure(page);
      const errors: string[] = [];
      for (const g of G.controls) {
        const c = m.controls.find((x: any) => x.text === g.text && x.section === g.section);
        if (!c) { errors.push(`MISSING control "${g.text}" in ${g.section}`); continue; }
        for (const k of ["background", "backgroundImage", "color", "borderTop", "borderBottom", "radius", "shadow", "font", "size"] as const) {
          if ((c[k] ?? "") !== (g[k] ?? "")) errors.push(`"${g.text}" ${k}: built ${c[k]}, golden ${g[k]}`);
        }
        if (!near(c.box.h, g.box.h, 2) || !near(c.box.w, g.box.w, 2)) errors.push(`"${g.text}" size ${c.box.w}x${c.box.h}, golden ${g.box.w}x${g.box.h}`);
      }
      for (const c of m.controls) if (c.box.h < 44) errors.push(`"${c.text}" is ${c.box.h}px tall, under 44`);
      expect(errors, errors.join("\n")).toEqual([]);
    });

    test(`${L.id} E: artwork`, async ({ page }) => {
      await openInvite(page, L.id);
      const m = await measure(page);
      const errors: string[] = [];
      const art = G.images.filter((i: any) => !String(i.src).startsWith("icon:"));
      const rename = (s: string) => s.replace("mike-sulley.png", "monsters-pair.png").replace("89ef22e407288341bfdd38816200e884-76408eae.jpg", "monsters-mike.jpg");
      for (const g of art) {
        const want = rename(g.src);
        const i = m.images.find((x: any) => x.src.includes(want.split(".")[0]));
        if (!i) { errors.push(`MISSING artwork ${want}`); continue; }
        if (!near(i.box.x, g.box.x, 3) || !near(i.box.y, g.box.y, 3) || !near(i.box.w, g.box.w, 3) || !near(i.box.h, g.box.h, 3)) errors.push(`${want} box ${JSON.stringify(i.box)}, golden ${JSON.stringify(g.box)}`);
        if (i.objectFit !== g.objectFit || i.objectPosition !== g.objectPosition) errors.push(`${want} fit/position ${i.objectFit} ${i.objectPosition}, golden ${g.objectFit} ${g.objectPosition}`);
      }
      expect(errors, errors.join("\n")).toEqual([]);
    });

    test(`${L.id} F: whole page against the reference`, async ({ page }) => {
      await openInvite(page, L.id);
      const shot = await page.locator("main").screenshot({ animations: "disabled" });
      const d = diffPng(shot, L.open, `${L.id}-open.diff.png`);
      expect(Math.abs(d.actHeight - d.refHeight), `page height ${d.actHeight}, reference ${d.refHeight}`).toBeLessThanOrEqual(8);
      expect(d.ratio, `${(d.ratio * 100).toFixed(2)}% of pixels differ, see verify/out/${L.id}-open.diff.png`).toBeLessThanOrEqual(0.015);
    });

    test(`${L.id} G: envelope shut`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${BASE}/i/${TOKEN}?layout=${L.id}`);
      await page.evaluate(() => document.fonts.ready);
      const shot = await page.screenshot({ clip: { x: 0, y: 0, width: 390, height: golden[L.shutKey].size.h } });
      const d = diffPng(shot, L.shut, `${L.id}-shut.diff.png`);
      expect(d.ratio, `${(d.ratio * 100).toFixed(2)}% differ, see verify/out/${L.id}-shut.diff.png`).toBeLessThanOrEqual(0.02);
    });

    test(`${L.id} H: share card`, async ({ request }) => {
      const res = await request.get(`${BASE}/s/i/${TOKEN}/card.png?layout=${L.id}`);
      expect(res.status()).toBe(200);
      const buf = await res.body();
      const png = PNG.sync.read(buf);
      expect([png.width, png.height]).toEqual([1200, 630]);
      const d = diffPng(buf, L.card, `${L.id}-card.diff.png`);
      expect(d.ratio, `${(d.ratio * 100).toFixed(2)}% differ, see verify/out/${L.id}-card.diff.png`).toBeLessThanOrEqual(0.04);
    });

    test(`${L.id} I: no sideways scroll at 390 and 360`, async ({ page }) => {
      for (const width of [390, 360]) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(`${BASE}/i/${TOKEN}?layout=${L.id}`);
        await page.locator(".stage .tap").click();
        await page.waitForSelector(".env-root.done");
        const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
        expect(sw, `scrolls sideways at ${width}`).toBeLessThanOrEqual(cw);
      }
    });

    test(`${L.id} J: reduced motion opens at once`, async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
      const page = await ctx.newPage();
      await page.goto(`${BASE}/i/${TOKEN}?layout=${L.id}`);
      const t0 = Date.now();
      await page.locator(".stage .tap").click();
      await page.waitForSelector(".env-root.done");
      expect(Date.now() - t0).toBeLessThan(300);
      await ctx.close();
    });

    test(`${L.id} robustness: long name, five notes, no runsheet`, async ({ page }) => {
      test.skip(!ROBUST, "ROBUST_TOKEN is not set: this gate is required before REPORT.md says done");
      for (const width of [390, 360]) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(`${BASE}/i/${ROBUST}?layout=${L.id}`);
        await page.locator(".stage .tap").click();
        await page.waitForSelector(".env-root.done");
        const problems = await page.evaluate(() => {
          const out: string[] = [];
          if (document.documentElement.scrollWidth > document.documentElement.clientWidth) out.push("sideways scroll");
          document.querySelectorAll("main [data-section]").forEach((s) => {
            const S = s.getBoundingClientRect();
            s.querySelectorAll("*").forEach((el) => {
              if (!(el as HTMLElement).innerText?.trim() || el.children.length) return;
              const b = el.getBoundingClientRect();
              if (b.left < S.left - 1 || b.right > S.right + 1) out.push(`clipped: "${(el as HTMLElement).innerText.slice(0, 30)}"`);
            });
          });
          document.querySelectorAll("main button, main a").forEach((el) => { if (el.getBoundingClientRect().height < 44) out.push(`small target: ${el.textContent}`); });
          return out;
        });
        expect(problems, problems.join("\n")).toEqual([]);
      }
    });
  });
}
