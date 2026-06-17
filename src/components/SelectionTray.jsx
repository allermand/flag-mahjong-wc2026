import Card from './Card.jsx';

// Area B — selected cards packed left-to-right, followed by empty placeholder
// slots up to `limit`. Cards carry framer-motion `layout`, so when a matched
// pair is removed the remaining cards animate leftward into the freed slots.
export default function SelectionTray({ cards, poofIds, limit, onRegret }) {
  const empties = Math.max(0, limit - cards.length);

  return (
    <section className="tray" aria-label="Valgte kort">
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          variant="tray"
          poof={poofIds.has(card.id)}
          onClick={onRegret ? () => onRegret(card) : undefined}
        />
      ))}
      {Array.from({ length: empties }).map((_, i) => (
        <div className="tray__slot tray__slot--empty" key={`empty-${i}`} />
      ))}
    </section>
  );
}
