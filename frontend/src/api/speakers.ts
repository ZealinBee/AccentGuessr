import axios from "axios";

export interface CountryCounts {
  [country: string]: number;
}

export const getCountryCounts = async (): Promise<CountryCounts> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/speakers/country-counts`
  );
  return response.data;
};
