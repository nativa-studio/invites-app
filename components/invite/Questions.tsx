"use client";
import { useState } from "react";
import { copy } from "@/lib/copy";
import type { PublicEvent } from "@/lib/db/types";

// The questions themselves, apart from the form they sit in.
//
// There are two ways in: a personal link, which knows who you are, and the group link, which
// finds out as you answer. They ask the same things in the same order, and they used to do it
// from two copies of the same markup, which is how a question gets added in one place and
// quietly missed in the other.
//
// What a guest has already told us, if anything. A guest row satisfies this by shape, and the
// group link passes nothing at all the first time through.
export type Answers = {
  party_size?: number | null;
  children?: number | null;
  adults?: number | null;
  party_names?: string[];
  dietary?: string[];
  dietary_note?: string | null;
  allergies?: string | null;
  accessibility_note?: string | null;
  custom_answer?: string | null;
  emergency_name?: string | null;
  emergency_phone?: string | null;
  note?: string | null;
};

// What the host pencilled in, which seeds the counts until the guest gives their own.
export type Expected = { children?: number | null; adults?: number | null };

export function Stepper({ name, label, initial }: { name: string; label: string; initial: number }) {
  const [n, setN] = useState(initial);
  return (
    <div className="stepper">
      <span className="ql">{label}</span>
      <div className="ctl">
        <button type="button" aria-label={`Fewer ${label}`} onClick={() => setN(Math.max(0, n - 1))}>-</button>
        <output aria-live="polite">{n}</output>
        <button type="button" aria-label={`More ${label}`} onClick={() => setN(Math.min(20, n + 1))}>+</button>
      </div>
      <input type="hidden" name={name} value={n} />
    </div>
  );
}

export function YesQuestions({ e, had, expected }: { e: PublicEvent; had?: Answers; expected?: Expected }) {
  const a: Answers = had ?? {};
  const initialChildren = a.children ?? expected?.children ?? 1;
  const initialAdults = a.adults ?? expected?.adults ?? 1;
  const expectedTotal = (expected?.children ?? 0) + (expected?.adults ?? 0);
  const initialPartySize = a.party_size ?? (expectedTotal || 1);
  return (
    <>
      <div className="q">
        <span className="ql">{copy.questions.howMany}</span>
        {e.ask_party_mode === "split" ? (
          <>
            <Stepper name="children" label={copy.questions.children} initial={initialChildren} />
            <Stepper name="adults" label={copy.questions.adults} initial={initialAdults} />
          </>
        ) : (
          <Stepper name="party_size" label="people" initial={initialPartySize} />
        )}
      </div>
      {e.ask_names && (
        <div className="q">
          <label htmlFor="party_names">{copy.questions.names}</label>
          <input id="party_names" name="party_names" type="text" defaultValue={(a.party_names ?? []).join(", ")} placeholder="Mia, Sam and Priya" autoComplete="off" />
          <span className="hint">{copy.questions.namesHint}</span>
        </div>
      )}
      {/* Allergies first, and on their own. It is the answer that changes what may be in the room
          rather than what is on a plate, it is not always about food, and it is the one a host
          must not have to go looking for underneath a preference. Free text on purpose: a chip
          can say "nut free" and cannot say "peanuts, carries an epipen, other nuts are fine". */}
      {e.ask_allergies !== false && (
        <div className="q">
          <label htmlFor="allergies">{copy.questions.allergies}</label>
          <input id="allergies" name="allergies" type="text" defaultValue={a.allergies ?? ""} placeholder={copy.questions.allergiesNote} autoComplete="off" />
          <span className="hint">{copy.questions.allergiesHint}</span>
        </div>
      )}
      {e.ask_dietary && (
        <div className="q">
          <span className="ql">{copy.questions.dietary}</span>
          <div className="chips">
            {e.dietary_chips.map((c) => (
              <label className="chip" key={c}><input type="checkbox" name="dietary" value={c} defaultChecked={(a.dietary ?? []).includes(c)} />{c}</label>
            ))}
          </div>
          <input name="dietary_note" type="text" defaultValue={a.dietary_note ?? ""} placeholder={copy.questions.dietaryNote} aria-label={copy.questions.dietaryNote} />
        </div>
      )}
      {e.ask_accessibility && (
        <div className="q">
          <label htmlFor="accessibility_note">{copy.questions.access}</label>
          <input id="accessibility_note" name="accessibility_note" type="text" defaultValue={a.accessibility_note ?? ""} />
          <span className="hint">{copy.questions.accessHint}</span>
        </div>
      )}
      {e.custom_question && (
        <div className="q">
          <label htmlFor="custom_answer">{e.custom_question}</label>
          <input id="custom_answer" name="custom_answer" type="text" defaultValue={a.custom_answer ?? ""} />
        </div>
      )}
      {e.ask_emergency && (
        <div className="q">
          <label htmlFor="emergency_name">{copy.questions.emergencyName}</label>
          <input id="emergency_name" name="emergency_name" type="text" defaultValue={a.emergency_name ?? ""} />
          <label htmlFor="emergency_phone">{copy.questions.emergencyPhone}</label>
          <input id="emergency_phone" name="emergency_phone" type="tel" defaultValue={a.emergency_phone ?? ""} />
        </div>
      )}
      <NoteQuestion had={a} />
    </>
  );
}

export function NoteQuestion({ had, placeholder }: { had?: Answers; placeholder?: string }) {
  return (
    <div className="q">
      <label htmlFor="note">{copy.questions.note}</label>
      <textarea id="note" name="note" defaultValue={had?.note ?? ""} placeholder={placeholder} />
    </div>
  );
}

// Who is replying. Only the group link asks this: a personal link already knows, and asking
// someone their own name after you have greeted them by it reads as though the invite forgot.
export function WhoQuestion() {
  return (
    <>
      <div className="q">
        <label htmlFor="name">{copy.rsvp.yourName}</label>
        <input id="name" name="name" type="text" required autoComplete="name" />
      </div>
      <div className="q">
        <label htmlFor="phone">{copy.rsvp.yourMobile}</label>
        {/* Under the label rather than inside it. The reason for the box is worth saying and is
            not part of what the box is called, and in brackets on the end it pushed the label to
            three lines on a phone. */}
        <span className="hint" id="phone-why">{copy.rsvp.yourMobileHint}</span>
        <input id="phone" name="phone" type="tel" autoComplete="tel" aria-describedby="phone-why" />
      </div>
    </>
  );
}
