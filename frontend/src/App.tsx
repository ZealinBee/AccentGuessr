import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Volunteer from "./pages/Volunteer";
import "./scss/App.scss";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/volunteer" element={<Volunteer />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
