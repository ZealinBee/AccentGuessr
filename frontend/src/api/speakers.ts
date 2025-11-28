import axios from "axios";
import { env } from "@/lib/env";

export interface CountryCounts {
  [country: string]: number;
}

export const getCountryCounts = async (): Promise<CountryCounts> => {
  const response = await axios.get(
    `${env.API_URL}/speakers/country-counts`
  );
  return response.data;
};
