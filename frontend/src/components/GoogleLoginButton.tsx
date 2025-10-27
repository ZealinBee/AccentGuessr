import { GoogleLogin } from "@react-oauth/google";
import { useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../scss/GoogleLoginButton.scss";
import useAuth from "../hooks/useAuth";

interface LoginButtonProps {
  message? : string;
}

export default function LoginButton({ message }: LoginButtonProps) {
  const navigate = useNavigate();
  const auth = useAuth();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleSuccess = async (response: { credential?: string } | null) => {
    const idToken = response?.credential;
    const games = JSON.parse(localStorage.getItem("allRoundInfo") || "null");

    try {
      if (!idToken) return;
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/google`,
        { idToken, games },
        { withCredentials: true }
      );
      console.log("Backend response:", res.data);
      // persist token and update global auth state
      auth.login(res.data.accessToken);
      navigate("/");
    } catch (error) {
      console.error("Error during backend authentication:", error);
    }
  };

  const handleCustomButtonClick = () => {
    // Programmatically click the hidden Google button
    googleButtonRef.current
      ?.querySelector("div[role='button']")
      ?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true })
      );
  };

  return (
    <div>
      <div ref={googleButtonRef} style={{ display: "none" }}>
        <GoogleLogin onSuccess={handleSuccess} onError={() => {}} />
      </div>

      <button className="google-button" onClick={handleCustomButtonClick}>
        {message || "Login with Google to Save Progress"}
      </button>
    </div>
  );
}
