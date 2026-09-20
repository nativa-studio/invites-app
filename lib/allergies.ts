// Whether an allergy answer actually says anything.
//
// The question is asked of everybody who says yes, so plenty of people answer it politely with
// "No" or "N/A". Those are not allergies, and a summary that lists them buries the one line that
// matters: Romik carries an epipen, under two people who wrote "No".
//
// It has to be careful in one direction only. Hiding a real allergy is the bad outcome and there
// is no acceptable rate of it, so nothing is hidden on a guess. A whole answer made only of a
// negative and filler words is nothing; anything with a real word in it is kept, however it
// starts. "No nuts" keeps its nuts.
const NEGATIVES = new Set(["no", "not", "none", "nope", "nah", "nil", "nothing", "na", "n/a", "n.a", "nada", "zero", "zilch", "x", "-", "--", "nup"]);

// Words that can sit around a negative without adding anything: "none that we know of", "no
// allergies thanks". Deliberately short. A word that is not on this list and not a negative is
// treated as real content, which is the safe way round.
const FILLER = new Set([
  "allergies", "allergy", "allergic", "known", "that", "we", "i", "know", "of", "at", "all",
  "thanks", "thank", "you", "really", "aware", "am", "applicable", "here", "none",
  "no", "not", "any", "to", "report", "us", "our", "one", "the", "is", "are", "have", "has",
  "for", "me", "my", "them", "they", "he", "she", "it", "this", "time",
]);

export function saysNoAllergy(raw: string | null | undefined): boolean {
  const text = (raw ?? "").toLowerCase().replace(/[.,!;:()"']/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return true;
  const words = text.split(" ").filter(Boolean);
  // A single token that is a plain no, including the punctuation-only ones people type.
  if (words.length === 1 && NEGATIVES.has(words[0])) return true;
  // Or a whole answer built from a negative plus filler, with at least one negative in it, so
  // "all good" on its own does not qualify but "no allergies that we know of" does.
  if (!words.some((w) => NEGATIVES.has(w))) return false;
  return words.every((w) => NEGATIVES.has(w) || FILLER.has(w));
}

/** The answers worth reading, which is the ones that say something. */
export function realAllergies<T extends { allergies?: string | null }>(guests: readonly T[]): T[] {
  return guests.filter((g) => !saysNoAllergy(g.allergies));
}
