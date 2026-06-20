/**
 * Crisis Detection Engine
 *
 * Detects crisis-related language in user-submitted text and provides
 * helpline resources. This is a keyword-based heuristic — not a clinical tool.
 */

const CRISIS_PATTERNS: string[] = [
  'kill myself',
  'end my life',
  'want to die',
  'suicide',
  'suicidal',
  'self-harm',
  'self harm',
  'cutting myself',
  'hurt myself',
  'no reason to live',
  'no point in living',
  "can't go on",
  'better off dead',
  'ending it all',
  'end it all',
  "don't want to exist",
  "don't want to be alive",
  'take my own life',
  'overdose',
  'jump off',
  'nobody would miss me',
  'world would be better without me',
];

export interface CrisisDetectionResult {
  isCrisis: boolean;
  matchedPatterns: string[];
}

export function detectCrisis(text: string): CrisisDetectionResult {
  const normalised = text.toLowerCase();
  const matchedPatterns: string[] = [];

  for (const pattern of CRISIS_PATTERNS) {
    if (normalised.includes(pattern.toLowerCase())) {
      matchedPatterns.push(pattern);
    }
  }

  return {
    isCrisis: matchedPatterns.length > 0,
    matchedPatterns,
  };
}

export interface HelplineInfo {
  country: string;
  flag: string;
  name: string;
  number: string;
  available: string;
}

export const CRISIS_HELPLINES: HelplineInfo[] = [
  {
    country: 'India',
    flag: '🇮🇳',
    name: 'iCall',
    number: '9152987821',
    available: 'Mon–Sat, 8am–10pm IST',
  },
  {
    country: 'India',
    flag: '🇮🇳',
    name: 'Vandrevala Foundation',
    number: '1860-2662-345',
    available: '24/7',
  },
  {
    country: 'India',
    flag: '🇮🇳',
    name: 'AASRA',
    number: '9820466726',
    available: '24/7',
  },
  {
    country: 'United States',
    flag: '🇺🇸',
    name: '988 Suicide & Crisis Lifeline',
    number: '988',
    available: '24/7',
  },
  {
    country: 'United Kingdom',
    flag: '🇬🇧',
    name: 'Samaritans',
    number: '116 123',
    available: '24/7',
  },
];

export const CRISIS_RESPONSE_MESSAGE =
  "We noticed something in what you shared, and we want you to know — you're not alone. " +
  "What you're feeling is valid, and there are caring, trained people ready to listen. " +
  'Please consider reaching out to one of the helplines below. ' +
  'Seeking help is a sign of incredible strength. 💛';
