// Pure game logic — no React, easy to reason about and test.

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `card-${idCounter}`;
}

// Fisher–Yates shuffle (returns a new array).
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick `boardSize` random teams and create two matching cards per team,
// then shuffle the resulting deck.
export function buildDeck(teams, boardSize) {
  const chosen = shuffle(teams).slice(0, Math.min(boardSize, teams.length));
  const cards = [];
  for (const team of chosen) {
    cards.push({ id: nextId(), code: team.code, name: team.name });
    cards.push({ id: nextId(), code: team.code, name: team.name });
  }
  return shuffle(cards);
}

// Build the board as a grid of stacks. Each stack holds `layers` cards
// (bottom -> top); only the top card of each stack is playable. Returns a
// fixed array of stacks so the grid never reflows as cards are removed.
export function buildBoard(teams, layers) {
  const deck = buildDeck(teams, teams.length);
  const stacks = [];
  for (let i = 0; i < deck.length; i += layers) {
    stacks.push(deck.slice(i, i + layers));
  }
  // Tag each card with its stack index so a regretted card knows where to return.
  stacks.forEach((stack, i) => stack.forEach((card) => { card.stack = i; }));
  return stacks;
}

// Reshuffle the flags still on the board. First count how many stacks the
// board has, then shuffle the remaining flags and drop each into a randomly
// chosen stack that still has room (capped at `layers`). Stacks therefore end
// up with varying heights (anywhere from empty up to `layers`) rather than the
// board being packed front-to-back. Cards already in the tray are untouched.
export function reshuffleStacks(stacks, layers) {
  const stackCount = stacks.length;
  const cards = shuffle(stacks.flat());
  const next = Array.from({ length: stackCount }, () => []);
  for (const card of cards) {
    const open = [];
    for (let i = 0; i < stackCount; i += 1) {
      if (next[i].length < layers) open.push(i);
    }
    const s = open[Math.floor(Math.random() * open.length)];
    next[s].push({ ...card, stack: s });
  }
  return next;
}

// Two cards match when they represent the same country.
export function isMatch(a, b) {
  return a.code === b.code;
}

// URL for a country's flag SVG. Uses the flag-icons 4x3 set, where every flag
// is drawn on a uniform 4:3 canvas — so no flag (e.g. Switzerland) is square.
export function flagUrl(code) {
  return `https://cdn.jsdelivr.net/gh/lipis/flag-icons@7/flags/4x3/${code}.svg`;
}
