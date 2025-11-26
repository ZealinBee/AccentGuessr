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

export const getVolunteerVoices = async (token: string | null): Promise<VolunteerVoice[]> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/submit-recordings/volunteer-voices`,
    { headers }
  );
  return response.data;
};

export const getAccents = async (token: string | null): Promise<Accent[]> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/submit-recordings/accents`,
    { headers }
  );
  return response.data;
};

export const rejectVolunteerVoice = async (
  id: number,
  token: string | null
): Promise<{ success: boolean; message: string }> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.patch(
    `${
      import.meta.env.VITE_API_URL
    }/submit-recordings/volunteer-voices/${id}/reject`,
    {},
    { headers }
  );
  return response.data;
};

export const acceptVolunteerVoice = async (
  id: number,
  accentId: number,
  token: string | null
): Promise<{ success: boolean; message: string; speakerId?: number }> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.patch(
    `${
      import.meta.env.VITE_API_URL
    }/submit-recordings/volunteer-voices/${id}/accept`,
    { accentId },
    { headers }
  );
  return response.data;
};
