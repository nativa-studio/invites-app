"use client";
import { useState } from "react";
import { copy } from "@/lib/copy";
import { LayoutThumb } from "./LayoutThumb";

import type { LayoutOption } from "@/lib/layouts";

export function LayoutPicker({ eventId, value, options }: { eventId: string; value: string; options: LayoutOption[] }) {
  const [chosen, setChosen] = useState(value);
  const src = `/app/preview/${eventId}?layout=${chosen}`;
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
            <LayoutThumb id={o.id} />
            <span className="n">{o.name}</span>
            <span className="b">{o.line}</span>
          </label>
        ))}
      </div>
      <span className="muted" style={{ fontSize: 13 }}>{copy.host.layoutHint}</span>
      <div className="screen">
        <iframe key={chosen} src={src} title={`Preview: ${chosen}`} loading="lazy" />
      </div>
      <a className="btn small" href={`${src}&full=1`} target="_blank" rel="noreferrer">{copy.host.openFull}</a>
    </div>
  );
}
