import axios from "axios";
import React, { useEffect } from "react";

function Multiplayer() {
  const createRoomHandler = async () => {
    await axios.post(`${import.meta.env.VITE_API_URL}/matches`);
  };

  return (
    <div>
      <a>CREATE ROOM</a>
      <p>or</p>
      <a>JOIN ROOM</a>
    </div>
  );
}

export default Multiplayer;
