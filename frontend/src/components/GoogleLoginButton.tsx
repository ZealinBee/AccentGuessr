import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

type GoogleCredential = {
  email: string;
  name: string;
  picture: string;
  sub: string;
};

export default function LoginButton() {
  const handleSuccess = async (response: any) => {
    const idToken = response.credential;
    const decoded: GoogleCredential = jwtDecode(idToken);

    console.log("Google User:", decoded);

    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/google`,
      { idToken },
      { withCredentials: true }
    );

    console.log("Backend response:", res.data);
    localStorage.setItem("token", res.data.accessToken);
  };

  const handleError = () => {
    console.error("Google Login Failed");
  };

  return (
    <div>
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
}
