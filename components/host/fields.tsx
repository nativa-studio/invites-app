// The form controls every panel is built from. Presentational only: what they render is decided
// by the panel, and what gets saved is decided by the field manifest the panel declares.

const s = (v: unknown) => (v == null ? "" : String(v));
const t = (v: unknown) => s(v).slice(0, 5);

// `rows` is not decoration. Without it this renders an <input>, which scrolls sideways: past the
// right edge the text is simply not on the screen, and a host typing a sentence cannot see what
// they are writing. Marcia hit this on "What is it?" in the group gift drawer, 17 October, with
// a scooter and a skateboard in it and both of them invisible.
//
// So: anything that holds a sentence gets rows. A name, a label, a time, a number or an address
// does not, because those are one short thing and a growing box around them reads as an invitation
// to write more than there is to write.
export function Field({ id, label, value, hint, type = "text", rows }: { id: string; label: string; value: unknown; hint?: string; type?: string; rows?: number }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {rows
        ? <textarea id={id} name={id} defaultValue={s(value)} rows={rows} />
        : <input id={id} name={id} type={type} defaultValue={type === "time" ? t(value) : s(value)} />}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

export function Choice({ id, label, value, options, hint }: { id: string; label: string; value: unknown; options: [string, string][]; hint?: string }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} name={id} defaultValue={s(value)}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

export function Switch({ id, label, value, hint }: { id: string; label: string; value: unknown; hint?: string }) {
  return (
    <div className="field">
      <label className="switch" htmlFor={id}>
        <input id={id} type="checkbox" name={id} defaultChecked={Boolean(value)} />
        <span>{label}</span>
      </label>
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}
