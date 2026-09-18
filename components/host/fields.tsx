// The form controls every panel is built from. Presentational only: what they render is decided
// by the panel, and what gets saved is decided by the field manifest the panel declares.

const s = (v: unknown) => (v == null ? "" : String(v));
const t = (v: unknown) => s(v).slice(0, 5);

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
