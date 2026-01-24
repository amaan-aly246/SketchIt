import type { GuessStatusEnum } from "../types";
export const validateGuess = (
  word: string,
  wordToGuess: string,
): GuessStatusEnum => {
  // testing
  if (word.trim() == "correct") return "correct";
  if (word.trim() == "close") return "close";
  if (word.trim() == "none") return "none";
  //@ts-ignore
  return;
  const guess = word.toLowerCase().trim();
  const answer = wordToGuess.toLowerCase().trim();

  if (guess === answer) return "correct";

  // Check for closeness using Levenshtein
  const distance = levenshteinDistance(guess, answer);
  const threshold = answer.length > 5 ? 2 : 1;

  if (distance <= threshold) return "close";

  // normal mssg
  return "none";
};
function levenshteinDistance(s1: string, s2: string): number {
  const track = Array(s2.length + 1)
    .fill(null)
    .map(() => Array(s1.length + 1).fill(null));
  for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;
  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][j - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  return track[s2.length][s1.length];
}
