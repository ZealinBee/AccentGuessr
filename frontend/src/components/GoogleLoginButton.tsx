import { GoogleLogin } from "@react-oauth/google";
import { useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../scss/GoogleLoginButton.scss";
import useAuth from "../hooks/useAuth";

interface LoginButtonProps {
  message?: string;
  navigateTo?: string;
}

export default function LoginButton({ message, navigateTo }: LoginButtonProps) {
  const navigate = useNavigate();
  const auth = useAuth();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (response: { credential?: string } | null) => {
    const idToken = response?.credential;
    const games = JSON.parse(localStorage.getItem("allRoundInfo") || "null");

    try {
      if (!idToken) return;
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/google`,
        { idToken, games },
        { withCredentials: true }
      );
      auth.login(
        res.data.accessToken,
        res.data.user.name,
        res.data.user.picture,
        res.data.user.id
      );
      navigate(navigateTo ? `/${navigateTo}` : "/");
    } catch (error) {
      console.error("Error during backend authentication:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomButtonClick = () => {
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 48 48"
          className="google-icon"
        >
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.89 2.97 30.47 0 24 0 14.64 0 6.51 5.38 2.56 13.22l7.98 6.2C12.18 13.04 17.64 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.13 24.5c0-1.54-.14-3.02-.4-4.45H24v8.42h12.43c-.54 2.85-2.14 5.26-4.57 6.89l7.02 5.45c4.1-3.8 6.45-9.4 6.45-16.31z"
          />
          <path
            fill="#FBBC05"
            d="M10.54 28.06A14.48 14.48 0 019.5 24c0-1.4.24-2.76.67-4.06l-7.98-6.2A23.9 23.9 0 000 24c0 3.87.92 7.53 2.56 10.82l7.98-6.76z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.9-5.79l-7.02-5.45C30.86 38.45 27.63 39.5 24 39.5c-6.36 0-11.82-3.54-14.46-8.68l-7.98 6.76C6.51 42.62 14.64 48 24 48z"
          />
        </svg>

        <span>{message || "Login to Save Progress"}</span>

        {loading && <span className="loading-spinner" aria-hidden="true" />}
      </button>
    </div>
  );
}
