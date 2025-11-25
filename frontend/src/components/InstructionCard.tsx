import { useState, useEffect } from "react";
import { HelpCircle, ChevronUp } from "lucide-react";
import "../scss/InstructionCard.scss";

export default function InstructionCard() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-collapse on mobile by default
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  }, [isMobile]);

  return (
    <div className={`instruction-card ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button
        className="instruction-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? "Hide instructions" : "Show instructions"}
      >
        {isExpanded ? <ChevronUp size={16} /> : <HelpCircle size={16} />}
      </button>

      {isExpanded && (
        <>
          <div className="instruction-title">
            <h2>Instructions</h2>
          </div>
          <ol className="instruction-list">
            <li>Try to guess where this person is from based on their English accent</li>
            <li>Click to place your guess</li>
            <li>Confirm your guess</li>
          </ol>
        </>
      )}
    </div>
  );
}
