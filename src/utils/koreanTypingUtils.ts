const INITIAL_CONSONANTS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];
const MEDIAL_VOWELS = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];
const FINAL_CONSONANTS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

const HANGUL_START_CODE = 0xAC00; // '가'
const HANGUL_END_CODE = 0xD7A3;   // '힣'

/**
 * Decomposes a single Korean character into its initial, medial, and final Jamo.
 * Returns an array of Jamo characters. For non-Hangul characters, returns the character itself.
 */
export const decomposeKorean = (char: string): string[] => {
  const charCode = char.charCodeAt(0);

  if (charCode < HANGUL_START_CODE || charCode > HANGUL_END_CODE) {
    // Not a Hangul syllable, return the character itself
    return [char];
  }

  const unicodeOffset = charCode - HANGUL_START_CODE;

  const initialIndex = Math.floor(unicodeOffset / (21 * 28));
  const medialIndex = Math.floor((unicodeOffset % (21 * 28)) / 28);
  const finalIndex = unicodeOffset % 28;

  const jamo: string[] = [
    INITIAL_CONSONANTS[initialIndex],
    MEDIAL_VOWELS[medialIndex],
  ];

  if (finalIndex !== 0) {
    jamo.push(FINAL_CONSONANTS[finalIndex]);
  }

  return jamo;
};

/**
 * Compares two Korean characters at the Jamo level.
 * Returns true if all decomposed Jamo match, false otherwise.
 */
export const compareKoreanJamo = (targetChar: string, typedChar: string): boolean => {
  const targetJamo = decomposeKorean(targetChar);
  const typedJamo = decomposeKorean(typedChar);

  if (targetJamo.length !== typedJamo.length) {
    return false;
  }

  for (let i = 0; i < targetJamo.length; i++) {
    if (targetJamo[i] !== typedJamo[i]) {
      return false;
    }
  }
  return true;
};

/**
 * Returns the number of Jamo in a Korean character.
 * For non-Hangul characters, returns 1.
 */
export const getJamoLength = (char: string): number => {
  const charCode = char.charCodeAt(0);
  if (charCode < HANGUL_START_CODE || charCode > HANGUL_END_CODE) {
    return 1; // Non-Hangul character
  }
  const unicodeOffset = charCode - HANGUL_START_CODE;
  const finalIndex = unicodeOffset % 28;
  return finalIndex === 0 ? 2 : 3; // 2 Jamo (초성+중성) or 3 Jamo (초성+중성+종성)
};
