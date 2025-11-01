import { useContext } from "react";
import MatchContext from "../context/MatchContext";

export const useMatch = () => useContext(MatchContext);
