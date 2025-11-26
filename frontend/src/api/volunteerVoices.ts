import axios from "axios";

export interface VolunteerVoice {
  id: number;
  url: string;
  status: "accepted" | "pending" | "rejected";
  userEmail: string | null;
  createdAt: string;
  nativeLanguage: string;
  country: string | null;
}

export interface Accent {
  id: number;
  name: string;
  description: string | null;
  type: string | null;
  createdAt: string;
}

export const getVolunteerVoices = async (): Promise<VolunteerVoice[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/submit-recordings/volunteer-voices`
  );
  return response.data;
};

export const getAccents = async (): Promise<Accent[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/submit-recordings/accents`
  );
  return response.data;
};

export const rejectVolunteerVoice = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await axios.patch(
    `${
      import.meta.env.VITE_API_URL
    }/submit-recordings/volunteer-voices/${id}/reject`
  );
  return response.data;
};

export const acceptVolunteerVoice = async (
  id: number,
  accentId: number
): Promise<{ success: boolean; message: string; speakerId?: number }> => {
  const response = await axios.patch(
    `${
      import.meta.env.VITE_API_URL
    }/submit-recordings/volunteer-voices/${id}/accept`,
    { accentId }
  );
  return response.data;
};
