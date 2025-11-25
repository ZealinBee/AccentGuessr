import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Volunteer from "./pages/Volunteer";
import "./scss/App.scss";
import Dashboard from "./pages/Dashboard";
import MultiplayerLobby from "./pages/MultiplayerLobby";
import Multiplayer from "./pages/Multiplayer";
import MyVoice from "./pages/MyVoice";
import VolunteerDashboard from "./pages/VolunteerDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/volunteer" element={<Volunteer />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/join/:matchCode" element={<MultiplayerLobby />} />
      <Route path="/multiplayer" element={<Multiplayer />} />
      <Route path="/my-voice" element={<MyVoice />} />
      <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
    </Routes>
  );
}

export default App;
