import Card from './Card.jsx';

// Area A — a fixed grid of stacks. Each stack layers cards on top of one
// another; only the top card is playable. Cells never move when a card is
// removed: the layer beneath simply becomes the new top.
export default function GameBoard({ stacks, onCardClick }) {
  return (
    <section className="board" aria-label="Spillebrett">
      {stacks.map((stack, i) => (
        <div className="stack" key={i}>
          {stack.map((card, layer) => {
            const isTop = layer === stack.length - 1;
            return (
              <div
                className="stack__slot"
                key={card.id}
                style={{ '--layer': layer, zIndex: layer }}
              >
                <Card
                  card={card}
                  variant="board"
                  covered={!isTop}
                  onClick={() => onCardClick(card)}
                />
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}
