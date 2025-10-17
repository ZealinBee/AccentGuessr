import "../scss/InstructionCard.scss";

export default function InstructionCard() {
  return (
    <div className="instruction-card">
      <div className="instruction-title">
        <h2>Instructions</h2>
      </div>
      <ol className="instruction-list">
        <li>Try to guess where this person is from based on their English accent</li>
        <li>Click to place your guess</li>
        <li>Confirm your guess</li>
      </ol>
    </div>
  );
}
