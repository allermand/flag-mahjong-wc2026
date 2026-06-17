import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GameBoard from './components/GameBoard.jsx';
import SelectionTray from './components/SelectionTray.jsx';
import { buildBoard, reshuffleStacks, isMatch, flagUrl } from './game/logic.js';
import { TEAMS, LAYERS, TRAY_LIMIT, REGRET_LIMIT, SHUFFLE_LIMIT } from './game/teams.js';

// Matched cards show briefly (SHOW_MS) so the clicked card flies in, then poof
// for POOF_MS, after which they're removed from the tray entirely.
const SHOW_MS = 200;
const POOF_MS = 340;
const TOTAL_PAIRS = TEAMS.length;

export default function App() {
  const [stacks, setStacks] = useState(() => buildBoard(TEAMS, LAYERS));
  // Compact, left-to-right list of selected cards. When a pair is removed the
  // survivors slide left (animated via framer-motion `layout`).
  const [tray, setTray] = useState([]);
  const [poofIds, setPoofIds] = useState(() => new Set());
  const [matches, setMatches] = useState(0);
  const [result, setResult] = useState(null); // null | 'won' | 'lost'
  // The most recently matched country — whoever is matched last is crowned champion.
  const [lastMatch, setLastMatch] = useState(null); // { code, name }
  // Limited player aids, counting down to 0.
  const [regrets, setRegrets] = useState(REGRET_LIMIT);
  const [shuffles, setShuffles] = useState(SHUFFLE_LIMIT);

  // After a card leaves the board we re-focus the nearest remaining card so
  // keyboard play continues smoothly (e.g. onto the layer just revealed).
  const pendingFocus = useRef(null);

  const cardsLeft = stacks.reduce((n, s) => n + s.length, 0);
  const trayCount = tray.length;

  const newGame = useCallback(() => {
    setStacks(buildBoard(TEAMS, LAYERS));
    setTray([]);
    setPoofIds(new Set());
    setMatches(0);
    setResult(null);
    setLastMatch(null);
    setRegrets(REGRET_LIMIT);
    setShuffles(SHUFFLE_LIMIT);
  }, []);

  // Win when only the last matching pair remains (2 flags across board + tray).
  // Those two survivors are crowned the champions.
  useEffect(() => {
    if (result === null && cardsLeft + trayCount === 2) {
      const champ = stacks.flat()[0] || tray[0];
      if (champ) setLastMatch({ code: champ.code, name: champ.name });
      setResult('won');
    }
  }, [result, cardsLeft, trayCount, stacks, tray]);

  const handleCardClick = useCallback(
    (card) => {
      if (result !== null) return; // game over
      if (poofIds.has(card.id)) return; // already leaving

      // If selected via keyboard, remember where it was so we can re-focus
      // the nearest remaining card after it's removed.
      const active = document.activeElement;
      if (active && active.classList.contains('card--board')) {
        const r = active.getBoundingClientRect();
        pendingFocus.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }

      // Remove the clicked (top) card from its stack — other cells stay put.
      setStacks((prev) => prev.map((s) => s.filter((c) => c.id !== card.id)));

      setTray((prevTray) => {
        const partner = prevTray.find((c) => isMatch(c, card));
        // Append the clicked card to the right end of the list.
        const next = [...prevTray, card];

        if (partner) {
          // Match! Briefly show the clicked card flying in, then poof both,
          // then remove them — the survivors slide left to fill the gap.
          setMatches((m) => m + 1);
          setLastMatch({ code: card.code, name: card.name });
          setTimeout(() => {
            setPoofIds((ids) => new Set([...ids, partner.id, card.id]));
          }, SHOW_MS);
          setTimeout(() => {
            setTray((t) => t.filter((c) => c.id !== partner.id && c.id !== card.id));
            setPoofIds((ids) => {
              const updated = new Set(ids);
              updated.delete(partner.id);
              updated.delete(card.id);
              return updated;
            });
          }, SHOW_MS + POOF_MS);
          return next;
        }

        // No match — if this fills the tray with TRAY_LIMIT different flags, lose.
        if (next.length >= TRAY_LIMIT) {
          setResult('lost');
        }
        return next;
      });
    },
    [result, poofIds]
  );

  // Regret: click a tray flag to send it back onto its origin stack.
  const handleRegret = useCallback(
    (card) => {
      if (result !== null || regrets <= 0) return;
      if (poofIds.has(card.id)) return; // mid-poof, ignore
      setTray((prev) => prev.filter((c) => c.id !== card.id));
      setStacks((prev) => prev.map((s, i) => (i === card.stack ? [...s, card] : s)));
      setRegrets((r) => r - 1);
    },
    [result, regrets, poofIds]
  );

  // Shuffle: reshuffle the flags still on the board (tray untouched).
  const handleShuffle = useCallback(() => {
    if (result !== null || shuffles <= 0) return;
    setStacks((prev) => reshuffleStacks(prev, LAYERS));
    setShuffles((s) => s - 1);
  }, [result, shuffles]);

  // Keyboard: arrow keys move focus across the board; Enter/Space (native to
  // the <button>) selects the focused card; "n" starts a new game.
  useEffect(() => {
    const playableCards = () =>
      Array.from(document.querySelectorAll('.board .card--board:not(:disabled)'));
    const center = (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };

    const moveFocus = (dir) => {
      const cards = playableCards();
      if (cards.length === 0) return;
      const current = cards.includes(document.activeElement) ? document.activeElement : null;
      if (!current) {
        cards[0].focus();
        return;
      }
      const c = center(current);
      let best = null;
      let bestScore = Infinity;
      for (const el of cards) {
        if (el === current) continue;
        const p = center(el);
        const dx = p.x - c.x;
        const dy = p.y - c.y;
        let along;
        let across;
        if (dir === 'left') { if (dx >= -1) continue; along = -dx; across = Math.abs(dy); }
        else if (dir === 'right') { if (dx <= 1) continue; along = dx; across = Math.abs(dy); }
        else if (dir === 'up') { if (dy >= -1) continue; along = -dy; across = Math.abs(dx); }
        else { if (dy <= 1) continue; along = dy; across = Math.abs(dx); }
        // Prefer cards aligned with the travel direction, then the closest.
        const score = along + across * 2;
        if (score < bestScore) {
          bestScore = score;
          best = el;
        }
      }
      if (best) best.focus();
    };

    const dirs = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'up',
      ArrowDown: 'down',
    };

    const onKey = (e) => {
      if (e.key === 'n' || e.key === 'N') {
        newGame();
        return;
      }
      if (dirs[e.key]) {
        e.preventDefault();
        moveFocus(dirs[e.key]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [newGame]);

  // Re-focus the nearest remaining card after one is removed (keyboard flow).
  useEffect(() => {
    const point = pendingFocus.current;
    if (!point) return;
    pendingFocus.current = null;
    const cards = Array.from(document.querySelectorAll('.board .card--board:not(:disabled)'));
    if (cards.length === 0) return;
    let best = null;
    let bestDist = Infinity;
    for (const el of cards) {
      const r = el.getBoundingClientRect();
      const dx = r.left + r.width / 2 - point.x;
      const dy = r.top + r.height / 2 - point.y;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        best = el;
      }
    }
    // preventScroll keeps mouse play from jumping the viewport.
    if (best) best.focus({ preventScroll: true });
  }, [cardsLeft]);

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">
          <span role="img" aria-label="fotball">⚽</span> Hvem vinner VM 2026?
        </h1>
        <div className="app__stats">
          <span>Funnet: {matches} / {TOTAL_PAIRS}</span>
          <span className={trayCount >= TRAY_LIMIT - 1 ? 'is-danger' : undefined}>
            Skuff: {trayCount} / {TRAY_LIMIT}
          </span>
          <button type="button" className="btn" onClick={newGame}>
            Nytt spill
          </button>
        </div>
      </header>

      {/* Area B — selected cards (compact, left-to-right) */}
      <SelectionTray
        cards={tray}
        poofIds={poofIds}
        limit={TRAY_LIMIT}
        onRegret={regrets > 0 ? handleRegret : undefined}
      />

      {/* Area A — the stacked board */}
      <GameBoard stacks={stacks} onCardClick={handleCardClick} />

      <footer className="app__status">
        <span className={regrets === 0 ? 'is-spent' : undefined}>
          Angre: {regrets} / {REGRET_LIMIT}
        </span>
        <span className={shuffles === 0 ? 'is-spent' : undefined}>
          Stokk om: {shuffles} / {SHUFFLE_LIMIT}
        </span>
        <button
          type="button"
          className="btn"
          onClick={handleShuffle}
          disabled={shuffles <= 0 || result !== null}
        >
          🔀 Stokk om
        </button>
      </footer>

      <AnimatePresence>
        {result && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`overlay__card overlay__card--${result}`}
              initial={{ scale: 0.7, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              {result === 'won' && lastMatch && (
                <img
                  className="overlay__flag"
                  src={flagUrl(lastMatch.code)}
                  alt={lastMatch.name}
                />
              )}
              <h2>
                {result === 'won'
                  ? '🏆 Verdensmestere!'
                  : '💥 Skuffen ble full — spillet er over'}
              </h2>
              <p>
                {result === 'won'
                  ? `Det siste flagget som står igjen — ${lastMatch ? lastMatch.name : 'ditt siste par'} vinner VM 2026!`
                  : `Skuffen ble fylt opp med ${TRAY_LIMIT} forskjellige flagg.`}
              </p>
              <button type="button" className="btn btn--primary" onClick={newGame}>
                Spill igjen
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
