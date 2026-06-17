// Teams for the FIFA World Cup 2026 (48-team field).
//
// `code` is the flag code used by flagcdn (https://flagcdn.com/{code}.svg).
// Most are ISO 3166-1 alpha-2 codes; football associations like the Home
// Nations use flagcdn's special codes (gb-eng, gb-sct, gb-wls).
//
// The exact roster depends on qualification — edit this list freely.
export const TEAMS = [
  // CONCACAF (6) — inkluderer vertsnasjonene USA, Mexico, Canada
  { code: 'us', name: 'USA' },
  { code: 'mx', name: 'Mexico' },
  { code: 'ca', name: 'Canada' },
  { code: 'cw', name: 'Curaçao' },
  { code: 'ht', name: 'Haiti' },
  { code: 'pa', name: 'Panama' },
  // CONMEBOL (6)
  { code: 'ar', name: 'Argentina' },
  { code: 'br', name: 'Brasil' },
  { code: 'co', name: 'Colombia' },
  { code: 'ec', name: 'Ecuador' },
  { code: 'py', name: 'Paraguay' },
  { code: 'uy', name: 'Uruguay' },
  // UEFA (16)
  { code: 'at', name: 'Østerrike' },
  { code: 'be', name: 'Belgia' },
  { code: 'ba', name: 'Bosnia-Hercegovina' },
  { code: 'hr', name: 'Kroatia' },
  { code: 'cz', name: 'Tsjekkia' },
  { code: 'gb-eng', name: 'England' },
  { code: 'fr', name: 'Frankrike' },
  { code: 'de', name: 'Tyskland' },
  { code: 'nl', name: 'Nederland' },
  { code: 'no', name: 'Norge' },
  { code: 'pt', name: 'Portugal' },
  { code: 'gb-sct', name: 'Skottland' },
  { code: 'es', name: 'Spania' },
  { code: 'se', name: 'Sverige' },
  { code: 'ch', name: 'Sveits' },
  { code: 'tr', name: 'Tyrkia' },
  // CAF (10)
  { code: 'dz', name: 'Algerie' },
  { code: 'cv', name: 'Kapp Verde' },
  { code: 'cd', name: 'DR Kongo' },
  { code: 'eg', name: 'Egypt' },
  { code: 'gh', name: 'Ghana' },
  { code: 'ci', name: 'Elfenbenskysten' },
  { code: 'ma', name: 'Marokko' },
  { code: 'sn', name: 'Senegal' },
  { code: 'za', name: 'Sør-Afrika' },
  { code: 'tn', name: 'Tunisia' },
  // AFC (9)
  { code: 'au', name: 'Australia' },
  { code: 'ir', name: 'Iran' },
  { code: 'iq', name: 'Irak' },
  { code: 'jp', name: 'Japan' },
  { code: 'jo', name: 'Jordan' },
  { code: 'qa', name: 'Qatar' },
  { code: 'sa', name: 'Saudi-Arabia' },
  { code: 'kr', name: 'Sør-Korea' },
  { code: 'uz', name: 'Usbekistan' },
  // OFC (1)
  { code: 'nz', name: 'New Zealand' },
];

// Use the entire 48-team field (each flag -> a pair of cards = 96 cards).
export const BOARD_SIZE = TEAMS.length;

// Board grid: fixed at 4 columns × 6 rows = 24 stacks.
export const COLUMNS = 4;
export const ROWS = 6;

// Cards in each board cell are stacked this many layers deep (only the top
// card of a stack is clickable — the rest stay hidden underneath).
// 24 stacks × 4 layers = 96 cards (the full 48-team field, paired).
export const LAYERS = 4;

// Maximum cards allowed in the selection tray (B). Exceeding it loses the game.
export const TRAY_LIMIT = 4;

// Player aids, each usable a limited number of times per game.
export const REGRET_LIMIT = 3; // send a tray flag back to the board
export const SHUFFLE_LIMIT = 3; // reshuffle the flags remaining on the board
