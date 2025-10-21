import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../scss/Volunteer.scss";

type Quote = {
  joke: string;
};

type RecordingState = {
  [index: number]: {
    isRecording: boolean;
    isRecorded: boolean;
    audioBlob: Blob | null;
  };
};

function Volunteer() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState<boolean>(true);
  const [recordingStates, setRecordingStates] = useState<RecordingState>({});
  const [selectedQuoteIndex, setSelectedQuoteIndex] = useState<number | null>(
    null
  );
  const [nativeLanguage, setNativeLanguage] = useState<string>("");
  const [countryOfOrigin, setCountryOfOrigin] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Calculate number of recordings
  const recordingCount = Object.values(recordingStates).filter(
    (state) => state.isRecorded && state.audioBlob
  ).length;

  // Check if form is valid
  const isFormValid = recordingCount >= 1 && nativeLanguage.trim() !== "";

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setIsLoadingQuotes(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/quotes`
        );
        setQuotes(response.data);
      } catch (error) {
        console.error("Error fetching quotes:", error);
      } finally {
        setIsLoadingQuotes(false);
      }
    };
    fetchQuotes();
  }, []);

  const startRecording = async (index: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/mp4;codecs=aac")
        ? "audio/mp4"
        : MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm"
        : "";
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        setRecordingStates((prev) => ({
          ...prev,
          [index]: {
            isRecording: false,
            isRecorded: true,
            audioBlob,
          },
        }));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecordingStates((prev) => ({
        ...prev,
        [index]: {
          isRecording: true,
          isRecorded: false,
          audioBlob: null,
        },
      }));
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert(
        "Could not access microphone. Please ensure you have granted permission."
      );
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const restartRecording = (index: number) => {
    if (recordingStates[index]?.isRecording) {
      stopRecording();
    }
    setTimeout(() => {
      startRecording(index);
    }, 100);
  };

  const handleQuoteClick = (index: number) => {
    // Toggle selection - if already selected, deselect it
    if (selectedQuoteIndex === index) {
      setSelectedQuoteIndex(null);
    } else {
      setSelectedQuoteIndex(index);
    }
  };

  const handleStartRecording = (index: number) => {
    startRecording(index);
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleReRecord = (index: number) => {
    restartRecording(index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      alert(
        "Please complete at least 1 recording and fill in your native language."
      );
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("nativeLanguage", nativeLanguage);
    if (countryOfOrigin) {
      formData.append("countryOfOrigin", countryOfOrigin);
    }

    // Add all recordings
    Object.entries(recordingStates).forEach(([index, state]) => {
      if (state.isRecorded && state.audioBlob) {
        formData.append(
          `recording_${index}`,
          state.audioBlob,
          `recording_${index}.webm`
        );
        formData.append("quoteId", quotes[Number(index)].joke);
      }
    });

    // navigate is from useNavigate above

    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/submit-recordings`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(
        "Thank you! Your recordings have been submitted successfully, the recording will be added soon."
      );

      // Reset form
      setRecordingStates({});
      setNativeLanguage("");
      setCountryOfOrigin("");
      setSelectedQuoteIndex(null);

      // Navigate to home after success
      navigate("/");
    } catch (error) {
      console.error("Error submitting recordings:", error);
      alert("There was an error submitting your recordings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="volunteer-container">
      <div className="instructions">
        <h1>Thanks for Volunteering! Here's the instructions:</h1>
        <ol>
          <li>Find a quiet place to record your accent.</li>
          <li>Click on any quote card to expand it</li>
          <li>Record yourself reading the quote</li>
          <li>
            Record at least one quote (you can make more if you want! We'll more
            likely use your clip)
          </li>
          <li>Scroll down and submit your recording</li>
        </ol>
      </div>

      {isLoadingQuotes ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading quotes...</p>
        </div>
      ) : quotes.length > 0 ? (
        <div className="quotes-container">
          {quotes.map((quote, index) => {
            const state = recordingStates[index];
            const isRecording = state?.isRecording || false;
            const isRecorded = state?.isRecorded || false;
            const isSelected = selectedQuoteIndex === index;

            return (
              <div key={index} className="quote-item">
                <blockquote
                  onClick={() => handleQuoteClick(index)}
                  className={`blockquote ${isSelected ? "selected" : ""} ${
                    isRecorded ? "recorded" : ""
                  }`}
                >
                  {isRecorded && <span className="checkmark">✓</span>}
                  {quote.joke}
                </blockquote>

                {isSelected && (
                  <div className="recording-controls">
                    {!isRecording && !isRecorded && (
                      <div className="not-recording-view">
                        <button
                          onClick={() => handleStartRecording(index)}
                          className="start-button"
                        >
                          🎤 Start Recording
                        </button>
                      </div>
                    )}

                    {isRecording && (
                      <div className="recording-view">
                        <div className="recording-indicator">
                          <span className="pulse-icon">🔴</span>
                          <span className="recording-text">
                            Recording in progress...
                          </span>
                        </div>
                        <button
                          onClick={handleStopRecording}
                          className="stop-button"
                        >
                          ⏹️ Stop Recording
                        </button>
                      </div>
                    )}

                    {isRecorded && !isRecording && (
                      <div className="recorded-view">
                        <p className="success-message">
                          ✓ Recording saved successfully!
                        </p>

                        {state?.audioBlob && (
                          <div className="audio-container">
                            <audio
                              controls
                              src={URL.createObjectURL(state.audioBlob)}
                            >
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}

                        <button
                          onClick={() => handleReRecord(index)}
                          className="rerecord-button"
                        >
                          🔄 Re-record
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-quotes-message">
          <p>No quotes available at the moment.</p>
        </div>
      )}

      <div className="submission-form-container">
        <h2>Submit Your Recordings</h2>
        <div className="recording-counter">
          <p>
            Recordings completed: <strong>{recordingCount}</strong>
            {recordingCount < 1 && (
              <span className="warning">
                {" "}
                (You need at least 1 recording to submit)
              </span>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="submission-form">
          <div className="form-group">
            <label htmlFor="nativeLanguage">
              Native Language <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nativeLanguage"
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value)}
              placeholder="e.g., American English, British English, Spanish, Mandarin"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="countryOfOrigin">
              Country of Origin <span className="optional">(Optional)</span>
            </label>
            <input
              type="text"
              id="countryOfOrigin"
              value={countryOfOrigin}
              onChange={(e) => setCountryOfOrigin(e.target.value)}
              placeholder="e.g., United States, Spain, China"
            />
          </div>

          <button
            type="submit"
            className={`submit-button ${
              !isFormValid || isSubmitting ? "disabled" : ""
            }`}
            disabled={!isFormValid || isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting
              ? `⏳ Submitting...`
              : !isFormValid
              ? `⏳ Complete Form and have at least 1 audio clip to Submit`
              : "✓ Submit Recordings"}
          </button>

          {!isFormValid && (
            <div className="validation-message">
              <p>Before submitting, please ensure:</p>
              <ul>
                <li className={recordingCount >= 1 ? "completed" : ""}>
                  {recordingCount >= 1 ? "✓" : "○"} At least 1 audio recording
                </li>
                <li className={nativeLanguage.trim() ? "completed" : ""}>
                  {nativeLanguage.trim() ? "✓" : "○"} Native language filled in
                </li>
              </ul>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Volunteer;
