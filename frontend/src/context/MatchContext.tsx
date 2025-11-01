import { createContext, useState, type Dispatch, type SetStateAction } from "react";

type Match = {
  id: number;
  code: number;
  status: string;
  ownerId: string;
  matchPlayers: MatchPlayer[];
};

type MatchPlayer = {
  guestName?: string;
  id: string;
  isGuest: boolean;
  userId?: string;
  score: number;
};

type MatchContextType = {
  match: Match | null;
  setMatch: Dispatch<SetStateAction<Match | null>>;
};

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const [match, setMatch] = useState<Match | null>(null);
  return (
    <MatchContext.Provider value={{ match, setMatch }}>
      {children}
    </MatchContext.Provider>
  );
}

export default MatchContext;
