import { useNavigate } from "react-router-dom";
import "../scss/EndScreen.scss";

interface EndScreenProps {
  totalScore: number;
}

function EndScreen({ totalScore }: EndScreenProps) {
  const navigate = useNavigate();
  return (
    <div className="end-screen-container">
      <div className="background-image"></div>
      <div className="background-overlay"></div>
      <div className="end-screen-card">
        <h1 className="end-screen-title">Thanks for playing! </h1>
        <h2 className="end-screen-score-heading">Your total score:</h2>
        <div className="end-screen-score">
          {totalScore.toLocaleString()} / 25,000
        </div>
        <p className="end-screen-message">
          This game is still in its early stages, stay tuned for new updates!
        </p>
        <p className="end-screen-message">If you are a master at delivering dad jokes, volunteer here, takes one minute!</p>
        <button onClick={() => navigate("/volunteer")} className="end-screen-volunteer-button">Volunteer</button>
      </div>
    </div>
  );
}

export default EndScreen;
