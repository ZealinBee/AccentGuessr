import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Volunteer from "./pages/Volunteer";
import "./scss/App.scss";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/volunteer" element={<Volunteer />} />
    </Routes>
  );
}

export default App;
