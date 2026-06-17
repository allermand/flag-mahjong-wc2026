import { motion } from 'framer-motion';
import { flagUrl } from '../game/logic.js';

// A single flag card. `variant` is 'board' or 'tray'.
// `covered` cards sit beneath the top of a stack — dimmed and not clickable.
// `poof` drives the vanish animation (zoom + blur + fade) via `animate`, so the
// card stays fully mounted until App removes it from state — no leftover ghosts.
// `layoutId` (the card's stable id) animates the move from the board into the tray.
export default function Card({ card, variant, onClick, covered = false, poof = false }) {
  return (
    <motion.button
      type="button"
      layoutId={card.id}
      // Tray cards animate position when neighbours are removed (slide left).
      layout={variant === 'tray' ? 'position' : false}
      className={`card card--${variant}${covered ? ' is-covered' : ''}`}
      onClick={covered ? undefined : onClick}
      disabled={covered}
      whileHover={covered || poof ? undefined : { scale: 1.06, y: -4 }}
      whileTap={covered || poof ? undefined : { scale: 0.94 }}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={
        poof
          ? { scale: 1.5, opacity: 0, rotate: 10, filter: 'blur(4px)' }
          : { scale: 1, opacity: 1, rotate: 0, filter: 'blur(0px)' }
      }
      // Spring for scale/rotate, but a plain tween for `filter`: a spring can
      // overshoot below its target, and blur(-0.00125px) is an invalid CSS value.
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        filter: { type: 'tween', duration: 0.3 },
      }}
      title={covered ? undefined : card.name}
    >
      <img
        className="card__flag"
        src={flagUrl(card.code)}
        alt={covered ? '' : card.name}
        draggable="false"
        loading="lazy"
      />
      <span className="card__name">{card.name}</span>
    </motion.button>
  );
}
