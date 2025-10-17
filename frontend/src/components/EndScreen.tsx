interface EndScreenProps {
  totalScore: number;
}

function EndScreen({ totalScore }: EndScreenProps) {
  return (
    <div>
      <h2>Well done!</h2>
      <p>Your total score is: {totalScore}</p>
    </div>
  )
}

export default EndScreen