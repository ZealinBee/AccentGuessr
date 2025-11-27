// Map of country names to their Mapbox ISO 3166-1 alpha-3 codes
export const countryToISO: { [key: string]: string } = {
  "China": "CHN",
  "Vietnam": "VNM",
  "Nepal": "NPL",
  "Saudi Arabia": "SAU",
  "India": "IND",
  "Germany": "DEU",
  "Finland": "FIN",
  "Morocco": "MAR",
  "Russia": "RUS",
  "United Kingdom": "GBR",
  "Spain": "ESP",
  "South Korea": "KOR",
  "Poland": "POL",
  "Australia": "AUS",
  "Ireland": "IRL",
  "Egypt": "EGY",
  "Chile": "CHL",
  "United States": "USA",
  "Ukraine": "UKR",
  "France": "FRA",
  "Portugal": "PRT",
  "Brazil": "BRA",
  "Turkey": "TUR",
  "Japan": "JPN",
  "Greece": "GRC",
  "Kazakhstan": "KAZ",
  "Canada": "CAN",
  "Philippines": "PHL",
  "Netherlands": "NLD",
  "Argentina": "ARG",
  "Ghana": "GHA",
};

// Map of country names to their approximate center coordinates [longitude, latitude]
export const countryCoordinates: { [key: string]: [number, number] } = {
  "China": [104.1954, 35.8617],
  "Vietnam": [108.2772, 14.0583],
  "Nepal": [84.1240, 28.3949],
  "Saudi Arabia": [45.0792, 23.8859],
  "India": [78.9629, 20.5937],
  "Germany": [10.4515, 51.1657],
  "Finland": [25.7482, 61.9241],
  "Morocco": [7.0926, 31.7917],
  "Morocoo": [7.0926, 31.7917], // Typo variant
  "Russia": [105.3188, 61.5240],
  "U.K": [-3.4360, 55.3781],
  "United Kingdom": [-3.4360, 55.3781],
  "United Kingdom ": [-3.4360, 55.3781], // Variant with space
  "U.K(Cockney)": [-0.1278, 51.5074], // London
  "Spain": [-3.7492, 40.4637],
  "South Korea": [127.7669, 35.9078],
  "Poland": [19.1451, 51.9194],
  "Australia": [133.7751, -25.2744],
  "Ireland": [-8.2439, 53.4129],
  "U.S(Iowa)": [-93.0977, 42.0115],
  "Egypt": [30.8025, 26.8206],
  "Chile": [-71.5430, -35.6751],
  "U.S": [-95.7129, 37.0902],
  "United States": [-95.7129, 37.0902],
  "U.S(California)": [-119.4179, 36.7783],
  "U.S(Kansas)": [-98.4842, 38.5266],
  "Ukraine": [31.1656, 48.3794],
  "France": [2.2137, 46.2276],
  "Portugal": [-8.2245, 39.3999],
  "Brazil": [-51.9253, -14.2350],
  "Turkey": [35.2433, 38.9637],
  "Japan": [138.2529, 36.2048],
  "Greece": [21.8243, 39.0742],
  "Kazakhstan": [66.9237, 48.0196],
  "Canada": [-106.3468, 56.1304],
  "Philippines": [121.7740, 12.8797],
  "Netherlands": [5.2913, 52.1326],
  "Argentina": [-63.6167, -38.4161],
  "Ghana": [-1.0232, 7.9465],
  "Unknown": [0, 0],
};

// Normalize country name to handle variants and typos
export const normalizeCountryName = (country: string): string => {
  const normalized = country.trim();

  // Handle specific variants
  if (normalized === "Morocoo") return "Morocco";
  if (normalized === "India ") return "India";
  if (normalized.startsWith("U.S")) return "United States";
  if (normalized.startsWith("U.K") || normalized.startsWith("United Kingdom")) {
    if (normalized.includes("Cockney")) return "United Kingdom"; // Map to main country for boundaries
    return "United Kingdom";
  }

  return normalized;
};
