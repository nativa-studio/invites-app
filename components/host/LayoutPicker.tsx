"use client";
import { useState } from "react";
import { copy } from "@/lib/copy";

// Little drawings of each layout's shape, so the difference is visible before the preview loads
// and still readable on a slow connection. Not screenshots: they have to hold for any event.
function Thumb({ id }: { id: string }) {
  const ink = "#2B2119", tint = "#E3D7BF", art = "#EFB93C";
  const box = { width: 56, height: 84, viewBox: "0 0 56 84" } as const;
  if (id === "lineup") {
    return (
      <svg {...box} aria-hidden="true">
        <rect x="1" y="1" width="54" height="82" rx="6" fill="#FDF6E4" stroke={ink} strokeWidth="1.6" />
        <rect x="14" y="10" width="28" height="4" rx="2" fill={ink} />
        <rect x="18" y="18" width="20" height="3" rx="1.5" fill={tint} />
        <rect x="4" y="27" width="48" height="13" rx="2" fill={art} />
        <rect x="10" y="46" width="36" height="2.5" rx="1.25" fill={tint} />
        <rect x="10" y="53" width="36" height="2.5" rx="1.25" fill={tint} />
        <rect x="10" y="60" width="26" height="2.5" rx="1.25" fill={tint} />
        <rect x="14" y="70" width="28" height="7" rx="3.5" fill="#E0553F" />
      </svg>
    );
  }
  if (id === "peek") {
    return (
      <svg {...box} aria-hidden="true">
        <rect x="1" y="1" width="54" height="82" rx="6" fill="#F9F0DA" stroke={ink} strokeWidth="1.6" />
        <circle cx="4" cy="14" r="7" fill="#7FAF95" stroke={ink} strokeWidth="1.2" />
        <circle cx="52" cy="14" r="7" fill="#E8763C" stroke={ink} strokeWidth="1.2" />
        <rect x="16" y="20" width="24" height="4" rx="2" fill={ink} />
        <rect x="8" y="33" width="40" height="16" rx="4" fill="#E7F1F5" />
        <circle cx="8" cy="33" r="5.5" fill="#93C7D6" stroke={ink} strokeWidth="1.2" />
        <rect x="8" y="54" width="40" height="16" rx="4" fill="#FBEBEF" />
        <circle cx="48" cy="54" r="5.5" fill="#F6C9D2" stroke={ink} strokeWidth="1.2" />
      </svg>
    );
  }
  if (id === "post") {
    return (
      <svg {...box} aria-hidden="true">
        <rect x="1" y="1" width="54" height="82" rx="6" fill="#FDF6E4" stroke={ink} strokeWidth="1.6" />
        <circle cx="6" cy="14" r="6" fill="#7FAF95" stroke={ink} strokeWidth="1.2" />
        <circle cx="50" cy="14" r="6" fill="#E8763C" stroke={ink} strokeWidth="1.2" />
        <rect x="6" y="16" width="44" height="26" rx="3" fill="#E0553F" stroke={ink} strokeWidth="1.4" />
        <path d="M6 18 L28 32 L50 18" fill="none" stroke={ink} strokeWidth="1.4" />
        <rect x="9" y="50" width="38" height="11" rx="3" fill="#FFFDF6" stroke={ink} strokeWidth="1.2" />
        <circle cx="10" cy="50" r="4.5" fill="#93C7D6" stroke={ink} strokeWidth="1.2" />
        <rect x="9" y="66" width="38" height="11" rx="3" fill="#FFFDF6" stroke={ink} strokeWidth="1.2" />
        <circle cx="46" cy="66" r="4.5" fill="#F6C9D2" stroke={ink} strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg {...box} aria-hidden="true">
      <rect x="1" y="1" width="54" height="82" rx="6" fill="#FDF6E4" stroke={ink} strokeWidth="1.6" />
      <rect x="6" y="6" width="44" height="30" rx="3" fill="#FFFDF6" stroke={ink} strokeWidth="1.4" />
      <path d="M6 8 L28 24 L50 8" fill="none" stroke={ink} strokeWidth="1.4" />
      <rect x="9" y="42" width="38" height="13" rx="3" fill="#FFFDF6" stroke={ink} strokeWidth="1.2" />
      <rect x="9" y="59" width="38" height="13" rx="3" fill="#FFFDF6" stroke={ink} strokeWidth="1.2" />
    </svg>
  );
}

export type LayoutOption = { id: string; name: string; line: string };

export function LayoutPicker({ eventId, value, options }: { eventId: string; value: string; options: LayoutOption[] }) {
  const [chosen, setChosen] = useState(value);
  const src = `/app/events/${eventId}/preview?layout=${chosen}`;
  return (
    <div className="field">
      <span className="label-ish">{copy.host.layoutHeading}</span>
      <div className="layouts">
        {options.map((o) => (
          <label key={o.id} className={`layout ${chosen === o.id ? "on" : ""}`}>
            <input
              type="radio"
              name="layout_id"
              value={o.id}
              checked={chosen === o.id}
              onChange={() => setChosen(o.id)}
            />
            <Thumb id={o.id} />
            <span className="n">{o.name}</span>
            <span className="b">{o.line}</span>
          </label>
        ))}
      </div>
      <span className="muted" style={{ fontSize: 13 }}>{copy.host.layoutHint}</span>
      <div className="screen">
        <iframe key={chosen} src={src} title={`Preview: ${chosen}`} loading="lazy" />
      </div>
      <a className="btn small" href={src} target="_blank" rel="noreferrer">{copy.host.openFull}</a>
    </div>
  );
}
