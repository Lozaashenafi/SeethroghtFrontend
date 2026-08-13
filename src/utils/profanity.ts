// Mirrors the backend profanity filter (seethroght/src/shared/utils/profanityFilter.ts)
// — keep the word lists in sync when adding or removing terms.
// so users get an instant warning before the server rejects their post.
// Terms are matched as whole words (so "class" never trips on "ass") and common
// obfuscations are normalised first ("sh1t", "f*ck", "f.u.c.k", "b*tch").

const LEET_MAP: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '8': 'b',
  '@': 'a',
  '$': 's',
  '!': 'i',
};

const BAD_WORDS: readonly string[] = [
  'fuck', 'fucking', 'fucked', 'fucker', 'fuckers', 'fucks',
  'motherfucker', 'motherfucking',
  'shit', 'shits', 'shitty', 'shitting', 'bullshit', 'horseshit', 'shithead',
  'bitch', 'bitches', 'bitchy', 'bitchass',
  'ass', 'asshole', 'assholes', 'asshat', 'asswipe', 'dumbass', 'jackass',
  'arse', 'arsehole',
  'dick', 'dicks', 'dickhead', 'dickheads',
  'cunt', 'cunts',
  'whore', 'whores',
  'slut', 'sluts', 'slutty',
  'bastard', 'bastards',
  'pussy', 'pussies',
  'twat', 'twats',
  'wanker', 'wankers',
  'prick', 'pricks',
  'bollocks',
  'piss', 'pissing', 'pissed',
  'damnit', 'goddamn',
  'nigger', 'nigga', 'niggas',
  'faggot', 'faggots', 'fag',
  'retard', 'retards', 'retarded',
];

// Obfuscated spellings mapped to the canonical word shown to the user. Only
// NON-letter characters may sit between a pattern's letters, so "can't" can
// never resolve to "cunt" and "batch" never resolves to "bitch".
const VARIANTS: Record<string, string> = {
  fck: 'fuck', fuk: 'fuck', fuq: 'fuck', fux: 'fuck', fvck: 'fuck', fuxk: 'fuck',
  phuck: 'fuck', phuk: 'fuck', fock: 'fuck',
  fcking: 'fucking', fckin: 'fucking', fckng: 'fucking', fuking: 'fucking',
  phucking: 'fucking', phcking: 'fucking',
  sht: 'shit', shyt: 'shit', shts: 'shit', shtty: 'shit', shtting: 'shit',
  btch: 'bitch', btches: 'bitch',
  ashole: 'asshole', asholes: 'asshole', ahole: 'asshole', aholes: 'asshole',
  dck: 'dick', dcks: 'dick',
  cnt: 'cunt', cnts: 'cunt',
  pssy: 'pussy',
  fggot: 'faggot', fagot: 'faggot',
  rtard: 'retard',
};

interface TermPattern {
  pattern: string;
  label: string;
  regex: RegExp;
}

const PATTERNS: readonly TermPattern[] = [
  ...BAD_WORDS.map((word) => ({ pattern: word, label: word })),
  ...Object.entries(VARIANTS).map(([pattern, label]) => ({ pattern, label })),
].map(({ pattern, label }) => ({
  pattern,
  label,
  regex: new RegExp(
    `\\b${pattern
      .split('')
      .map((ch) => `${ch}[^a-z0-9_]*`)
      .join('')}\\b`,
  ),
}));

function normalize(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((ch) => LEET_MAP[ch] ?? ch)
    .join('');
}

/** Returns the profane terms found in `text`, or an empty array. */
export function findBadWords(text: string): string[] {
  if (!text) return [];
  const normalized = normalize(text);
  const found = new Set<string>();
  for (const { label, regex } of PATTERNS) {
    if (regex.test(normalized)) found.add(label);
  }
  return [...found];
}

/** A ready-to-show inline error message, or undefined when the text is clean. */
export function profanityError(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const words = findBadWords(value);
  if (words.length === 0) return undefined;
  return `Please remove the following inappropriate words before posting: ${words.join(', ')}`;
}
