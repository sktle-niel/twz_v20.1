/* Lightweight gibberish detection for free-text fields.
   Heuristics: real words carry vowels, don't pile consonants four-deep
   ("jahwdjaiwdop"), and don't repeat one letter three times in a row.
   Best-effort only — the backend must validate again server-side. */

const VOWELISH = /[aeiouy]/
const CONSONANT_RUN = /[bcdfghjklmnpqrstvwxz]{4,}/
const REPEAT_RUN = /(.)\1{2,}/
/* Digraphs that legitimately chain consonants (months, watch, lengths…). */
const DIGRAPHS = /th|ch|sh|ph|wh|gh|ck|ng|qu/g

function looksLikeWord(raw: string): boolean {
  const letters = raw.toLowerCase().replace(/[^a-zñ]/g, '')
  if (letters.length === 0) return true // numbers / punctuation tokens are fine
  /* Short all-caps tokens are treated as acronyms (CVT, ECU, TWZ). */
  if (raw.length <= 5 && raw === raw.toUpperCase() && /[A-Z]/.test(raw)) return true
  if (letters.length >= 3 && !VOWELISH.test(letters)) return false
  if (REPEAT_RUN.test(letters)) return false
  if (CONSONANT_RUN.test(letters.replace(DIGRAPHS, 'x'))) return false
  return true
}

/* True when every word in the text reads like a real word. */
export function isMeaningfulText(text: string, minLength = 3): boolean {
  const trimmed = text.trim()
  if (trimmed.length < minLength) return false
  return trimmed.split(/\s+/).every(looksLikeWord)
}

/* Complete name: letters only, at least first + last name, no gibberish. */
export function isValidFullName(name: string): boolean {
  const trimmed = name.trim()
  if (trimmed.replace(/[^a-zA-ZñÑ]/g, '').length < 4) return false
  if (!/^[a-zA-ZñÑ'. -]+$/.test(trimmed)) return false
  const words = trimmed.split(/\s+/)
  if (words.length < 2) return false
  return words.every(looksLikeWord)
}
