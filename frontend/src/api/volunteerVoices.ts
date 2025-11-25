import axios from "axios";

export interface VolunteerVoice {
  id: number;
  url: string;
  status: "accepted" | "pending" | "rejected";
  userEmail: string | null;
  createdAt: string;
}

export const getVolunteerVoices = async (): Promise<VolunteerVoice[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/submit-recordings/volunteer-voices`
  );
  return response.data;
};
