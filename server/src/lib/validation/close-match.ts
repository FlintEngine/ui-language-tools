import { levenshtein } from "../levenshtein";

export function closestMatch(word: string, candidates: readonly string[]): string | null {
  let best: string | null = null;
  let bestDist = Infinity;
  for (const candidate of candidates) {
    const d = levenshtein(word, candidate);
    if (d < bestDist) { bestDist = d; best = candidate; }
  }
  return bestDist <= Math.max(2, Math.floor(word.length * 0.4)) ? best : null;
}