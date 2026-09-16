// Gabriel's own cover, drawn after the poster reference: flat cobalt sky, halftone-shaded clouds,
// a snowy mountain over a dark tree line, a yellow field, a striped lake band, and the big yellow
// face cropped into the bottom corner. This is the party's own artwork (upload path), not a gallery set.
const SKY = "#2B6CB0", NAVY = "#1B2A4A", YEL = "#F5C531", CRM = "#F3E3B5", RED = "#D9432C", MTN = "#3D5F9A", MTN2 = "#4E77B8", FOREST = "#1F6F68", LAKE = "#A9CBE8", DOT = "#E0A424";

export function GabrielCover({ width = 282 }: { width?: number }) {
  const height = Math.round(width * 440 / 282);
  const kl = { stroke: NAVY, strokeWidth: 3.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <svg width={width} height={height} viewBox="0 0 282 440" role="img" aria-label="A yellow cartoon face peeking up in front of mountains and a lake">
      <defs>
        <pattern id="gc-dot-y" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.6" fill={DOT} /></pattern>
        <pattern id="gc-dot-n" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.4" fill={NAVY} /></pattern>
        <pattern id="gc-dot-b" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.5" fill={SKY} /></pattern>
        <clipPath id="gc-frame"><rect x="0" y="0" width="282" height="440" rx="8" /></clipPath>
        <clipPath id="gc-cloud-r"><path d="M150 168c0-30 26-44 48-36 8-24 46-30 62-8 14-6 30 2 32 20 12 2 18 12 16 26H150z" /></clipPath>
        <clipPath id="gc-cloud-l"><path d="M-20 200c0-20 20-32 38-26 8-20 40-24 52-6 12-4 26 4 26 18 10 2 14 10 12 22H-20z" /></clipPath>
      </defs>
      <g clipPath="url(#gc-frame)">
        <rect width="282" height="440" fill={SKY} />
        {/* clouds: cream tops, halftone yellow underneath */}
        <g>
          <path d="M150 168c0-30 26-44 48-36 8-24 46-30 62-8 14-6 30 2 32 20 12 2 18 12 16 26H150z" fill={CRM} {...kl} />
          <rect x="150" y="150" width="170" height="24" fill="url(#gc-dot-y)" clipPath="url(#gc-cloud-r)" />
          <path d="M-20 200c0-20 20-32 38-26 8-20 40-24 52-6 12-4 26 4 26 18 10 2 14 10 12 22H-20z" fill={CRM} {...kl} />
          <rect x="-20" y="188" width="140" height="22" fill="url(#gc-dot-y)" clipPath="url(#gc-cloud-l)" />
          <path d="M100 100c2-8 12-10 18-6 4-8 18-8 22 0 6-2 10 2 10 6z" fill={CRM} {...kl} />
          <path d="M170 106c2-6 10-8 14-4 4-6 14-6 18 0 4-2 8 2 8 4z" fill={CRM} {...kl} />
        </g>
        {/* mountain: two slopes, snow cap with a ragged edge */}
        <path d="M30 236l58-72 30 16 34-42 22 14 40 26 40 58z" fill={MTN} {...kl} />
        <path d="M118 180l34-42 22 14 40 26 22 32-44-22-18 10-26-18-16 12z" fill={MTN2} stroke="none" />
        <path d="M152 138l-14 20 8-2 6 10 8-8 8 6 6-10 8 6 4-10-6 2-10-10-12 2z" fill={CRM} {...kl} />
        <path d="M30 236l58-72 30 16 34-42" fill="none" {...kl} />
        {/* tree line and field */}
        <path d="M-10 250l16-14 12 10 14-12 12 8 16-14 10 10 14-10 12 12 14-14 12 10 16-12 12 12 14-10 12 10 14-12 14 12 12-10 12 12 16-12 12 10 16-14v40H-10z" fill={FOREST} {...kl} />
        <path d="M-10 262c30 4 60-4 90 2s60-6 90 0 60-4 90 0 40-2 42 0v14H-10z" fill={NAVY} />
        <rect x="-10" y="272" width="302" height="48" fill={YEL} {...kl} />
        <rect x="-10" y="276" width="302" height="40" fill="url(#gc-dot-y)" opacity="0.8" />
        <g fill={FOREST} {...kl}>
          <path d="M26 298l9-16 9 16z" /><path d="M46 304l8-14 8 14z" /><path d="M222 300l9-16 9 16z" /><path d="M244 306l8-14 8 14z" /><path d="M262 298l8-14 8 14z" />
        </g>
        {/* lake band with stripes, then the foreground bank */}
        <rect x="-10" y="320" width="302" height="30" fill={LAKE} {...kl} />
        <rect x="-10" y="322" width="302" height="26" fill="url(#gc-dot-b)" opacity="0.5" />
        <path d="M0 330h60M80 338h70M170 328h60" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
        <rect x="-10" y="350" width="302" height="100" fill={CRM} {...kl} />
        <rect x="-10" y="352" width="302" height="98" fill="url(#gc-dot-y)" opacity="0.6" />
        <path d="M-10 400c20-10 40-10 56 0s30 12 46 0 30-12 46 0" fill={YEL} {...kl} />
        <path d="M10 424c14-8 28-8 40 0s22 8 34 0" fill={YEL} {...kl} />
        {/* the face, cropped into the corner */}
        <g>
          <path d="M92 470c-10-80 40-160 140-172 44-6 80 6 100 24v148z" fill={YEL} {...kl} />
          <path d="M138 336L58 138l32-16 120 190z" fill={YEL} {...kl} />
          <path d="M58 138l32-16 54 86-26 22z" fill={NAVY} {...kl} />
          <path d="M92 470c-10-80 40-160 140-172" fill="none" {...kl} />
          <circle cx="206" cy="392" r="28" fill={NAVY} />
          <circle cx="218" cy="380" r="10" fill={CRM} />
          <path d="M268 396c-6-2-12 2-10 8 4-4 10-4 14 0 2-4-1-8-4-8z" fill={NAVY} />
          <ellipse cx="146" cy="452" rx="34" ry="40" fill={RED} {...kl} />
        </g>
      </g>
      <rect x="1.75" y="1.75" width="278.5" height="436.5" rx="8" fill="none" stroke={NAVY} strokeWidth="3.5" />
    </svg>
  );
}
