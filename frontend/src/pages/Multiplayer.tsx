import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useMatch } from "../hooks/useMatch";

function Multiplayer() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { setMatch } = useMatch();

  const createRoomHandler = async () => {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/matches`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );
    const code = res.data.code;
    if (!code) {
      alert("Server is down right now, please try again later.");
      return;
    }
    setMatch(res.data);
    navigate(`/join/${code}`);
  };

  return (
    <div>
      <button onClick={createRoomHandler}>CREATE ROOM</button>
      <p>or</p>
      <a>JOIN ROOM</a>
    </div>
  );
}

export default Multiplayer;
