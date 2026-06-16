# ⚽ Flag Mahjong — World Cup 2026

A Mahjong-style matching game built with **React + Vite**. Clear the stacked board
by matching pairs of flags from the 48 nations of the FIFA World Cup 2026.

## How to play

- The board is a 4×6 grid of stacks, each layered a few flags deep — only
  the **top** flag of a stack is playable.
- Click a flag to send it up to the selection tray.
- Click a flag in the tray that matches one already there and both **poof** away.
- The tray holds at most **4** flags — fill it with 4 different flags and you **lose**.
- Clear the board down to the **last matching pair** and those two flags are crowned
  **2026 World Champions** 🏆.

### Aids

- **Regret** (3×) — click a flag in the tray to send it back onto the board.
- **Shuffle** (3×) — reshuffle the flags remaining on the board (the tray is kept).

### Controls

- **Mouse / touch** — click flags.
- **Keyboard** — arrow keys move focus across the board, Enter/Space selects, `n` starts a new game.
- **🔊 / 🔇** — toggle sound (match poof, win fanfare, lose sting).

## Develop

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Tech

- React 18 + Vite
- [framer-motion](https://www.framer.com/motion/) for the move/poof/slide animations
- Flags from the [`flag-icons`](https://github.com/lipis/flag-icons) 4×3 set (via jsDelivr) — every flag in a uniform 4:3 format
- Sound effects synthesised at runtime with the Web Audio API (no audio files)
