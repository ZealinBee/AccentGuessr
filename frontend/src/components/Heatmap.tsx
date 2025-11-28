"use client"

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getCountryCounts } from "../api/speakers";
import { normalizeCountryName, countryToISO } from "../utils/countryCoordinates";
import "../scss/Heatmap.scss";
import { env } from "@/lib/env";

interface CountryData {
  country: string;
  count: number;
  iso: string;
}

function Heatmap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countryData, setCountryData] = useState<CountryData[]>([]);

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        setLoading(true);
        const counts = await getCountryCounts();

        // Process and normalize country data
        const processedData: CountryData[] = [];
        const countMap = new Map<string, number>();

        // Aggregate counts for country variants
        Object.entries(counts).forEach(([country, count]) => {
          const normalized = normalizeCountryName(country);
          const existing = countMap.get(normalized) || 0;
          countMap.set(normalized, existing + count);
        });

        // Create country data array with ISO codes
        countMap.forEach((count, country) => {
          const iso = countryToISO[country];
          if (iso) {
            processedData.push({
              country,
              count,
              iso,
            });
          }
        });

        setCountryData(processedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching country counts:", err);
        setError("Failed to load country data");
      } finally {
        setLoading(false);
      }
    };

    fetchCountryData();
  }, []);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    if (!mapContainerRef.current || countryData.length === 0) return;

    const mapboxToken = env.MAPBOX_ACCESS_TOKEN;
    if (mapboxToken) mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [20, 30],
      zoom: 1.5,
    });

    // Customize map background
    map.on("style.load", () => {
      map.setPaintProperty("background", "background-color", "#f8fafc");
    });

    mapRef.current = map;

    map.on("load", () => {
      // Find max count for scaling
      const maxCount = Math.max(...countryData.map((d) => d.count));

      // Create a lookup map for country counts by ISO code
      const isoToCount: { [iso: string]: number } = {};
      const isoToCountry: { [iso: string]: string } = {};

      countryData.forEach((data) => {
        isoToCount[data.iso] = data.count;
        isoToCountry[data.iso] = data.country;
      });

      // Add country boundaries fill layer
      map.addLayer({
        id: "country-fills",
        type: "fill",
        source: {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        },
        "source-layer": "country_boundaries",
        paint: {
          "fill-color": [
            "case",
            ["has", ["get", "iso_3166_1_alpha_3"], ["literal", isoToCount]],
            [
              "interpolate",
              ["linear"],
              ["get", ["get", "iso_3166_1_alpha_3"], ["literal", isoToCount]],
              0, "rgba(16, 185, 129, 0.25)",
              maxCount / 4, "rgba(52, 211, 153, 0.4)",
              maxCount / 2, "rgba(251, 191, 36, 0.5)",
              maxCount, "rgba(239, 68, 68, 0.65)",
            ],
            "rgba(0, 0, 0, 0)", // Transparent for countries without data
          ],
        },
      });

      // Add country boundaries outline layer
      map.addLayer({
        id: "country-borders",
        type: "line",
        source: {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        },
        "source-layer": "country_boundaries",
        paint: {
          "line-color": [
            "case",
            ["has", ["get", "iso_3166_1_alpha_3"], ["literal", isoToCount]],
            [
              "interpolate",
              ["linear"],
              ["get", ["get", "iso_3166_1_alpha_3"], ["literal", isoToCount]],
              0, "#10b981",
              maxCount / 4, "#34d399",
              maxCount / 2, "#fbbf24",
              maxCount, "#ef4444",
            ],
            "rgba(148, 163, 184, 0.15)", // Dim borders for countries without data
          ],
          "line-width": [
            "case",
            ["has", ["get", "iso_3166_1_alpha_3"], ["literal", isoToCount]],
            [
              "interpolate",
              ["linear"],
              ["get", ["get", "iso_3166_1_alpha_3"], ["literal", isoToCount]],
              0, 2,
              maxCount / 2, 3,
              maxCount, 4,
            ],
            1, // Thinner for countries without data
          ],
        },
      });

      // Add click interaction
      map.on("click", "country-fills", (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const iso = feature.properties?.iso_3166_1_alpha_3;

          if (iso && isoToCount[iso]) {
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="padding: 8px;">
                  <strong>${isoToCountry[iso]}</strong><br/>
                  Volunteers: ${isoToCount[iso]}
                </div>
              `)
              .addTo(map);
          }
        }
      });

      // Change cursor on hover
      map.on("mouseenter", "country-fills", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "country-fills", () => {
        map.getCanvas().style.cursor = "";
      });

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
    });

    return () => {
      try {
        if (map && typeof map.remove === 'function') {
          map.remove();
        }
        if (mapRef.current && typeof mapRef.current.remove === 'function') {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (error) {
        // Ignore cleanup errors - DOM might already be removed
        console.warn('Map cleanup error:', error);
      }
    };
  }, [countryData]);

  if (loading) {
    return (
      <div className="heatmap-container">
        <div className="heatmap-loading">Loading heatmap...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="heatmap-container">
        <div className="heatmap-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <p>
          Total volunteers: {countryData.reduce((sum, d) => sum + d.count, 0)} across{" "}
          {countryData.length} countries.
        </p>
      </div>
      <div ref={mapContainerRef} className="heatmap-map" />
      <div className="heatmap-legend">
        <div className="legend-title">Volunteer Intensity</div>
        <div className="legend-gradient">
          <span>Low</span>
          <div className="gradient-bar" />
          <span>High</span>
        </div>
      </div>
    </div>
  );
}

export default Heatmap;