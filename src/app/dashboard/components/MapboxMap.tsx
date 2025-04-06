"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Make sure to add your Mapbox token to your .env file
// NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface RouteStop {
  id: string;
  stopOrder: number;
  stop: Stop;
}

interface Route {
  id: string;
  name: string;
  description: string | null;
  routeStops: RouteStop[];
}

interface MapboxMapProps {
  route: Route;
}

export const MapboxMap: React.FC<MapboxMapProps> = ({ route }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [zoom, setZoom] = useState(12);
  const [styleLoaded, setStyleLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map only once
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        zoom: zoom,
      });

      // Add navigation control (zoom buttons)
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Set up style loaded listener
      map.current.on("style.load", () => {
        setStyleLoaded(true);
      });
    }

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Function to fetch directions between points
  const fetchDirections = async (coordinates: [number, number][]) => {
    // We'll need to break this into segments if there are more than 25 waypoints
    // as Mapbox has a limit (typically 25 including start/end)
    if (coordinates.length < 2) return null;

    // Format coordinates for the Mapbox Directions API
    const formattedCoords = coordinates
      .map((coord) => coord.join(","))
      .join(";");

    // Call the Mapbox Directions API
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${formattedCoords}?alternatives=false&geometries=geojson&overview=full&steps=false&access_token=${mapboxgl.accessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        return data.routes[0].geometry;
      }
      return null;
    } catch (error) {
      console.error("Error fetching directions:", error);
      return null;
    }
  };

  // Update map when route changes or style loads
  useEffect(() => {
    async function updateMap() {
      if (
        !map.current ||
        !styleLoaded ||
        !route.routeStops ||
        route.routeStops.length === 0
      )
        return;

      setIsLoading(true);

      // Clear previous markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Remove previous layers and sources if they exist
      if (map.current.getLayer("route-line")) {
        map.current.removeLayer("route-line");
      }

      if (map.current.getSource("route-source")) {
        map.current.removeSource("route-source");
      }

      // First, sort stops by their original stopOrder
      const sortedStops = [...route.routeStops].sort(
        (a, b) => a.stopOrder - b.stopOrder
      );

      // Now, split into odd and even stops based on their stopOrder value
      const oddStops = sortedStops.filter((stop) => stop.stopOrder % 2 === 1);
      const evenStops = sortedStops.filter((stop) => stop.stopOrder % 2 === 0);

      // Sort each group by their stopOrder to ensure proper sequencing
      oddStops.sort((a, b) => a.stopOrder - b.stopOrder);
      evenStops.sort((a, b) => a.stopOrder - b.stopOrder);

      // Combine them: odd stops first, then even stops
      const reorderedStops = [...oddStops, ...evenStops];

      // Create bounds to fit all stops
      const newBounds = new mapboxgl.LngLatBounds();

      // Add markers for each stop
      reorderedStops.forEach((routeStop, index) => {
        const { stop } = routeStop;

        // Extend bounds
        newBounds.extend([stop.longitude, stop.latitude]);

        // Create marker element
        const markerEl = document.createElement("div");
        markerEl.className = "flex flex-col items-center";

        // Create numbered circle with sequential display number
        const circle = document.createElement("div");
        circle.className =
          "w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm";
        circle.textContent = (index + 1).toString();

        // Create stop name label
        const label = document.createElement("div");
        label.className =
          "mt-1 px-2 py-1 bg-white rounded shadow text-xs font-medium";
        label.textContent = stop.name;

        // Combine elements
        markerEl.appendChild(circle);
        markerEl.appendChild(label);

        // Add marker to map
        const marker = new mapboxgl.Marker({ element: markerEl })
          .setLngLat([stop.longitude, stop.latitude])
          .addTo(map.current!);

        markersRef.current.push(marker);
      });

      try {
        // Get coordinates array for all stops
        const coordinates: [number, number][] = reorderedStops.map(
          (routeStop) => [routeStop.stop.longitude, routeStop.stop.latitude]
        );

        // For directions API: We need to handle Mapbox's limitation of 25 waypoints
        // If you have more than 25 stops, you'll need to break this into multiple API calls
        let routeGeometry = null;

        if (coordinates.length <= 25) {
          // Simple case - fetch directions in one call
          routeGeometry = await fetchDirections(coordinates);
        } else {
          // Complex case - we'd need to break this into segments
          // This is a simplified approach - for a production app, you might want a more sophisticated chunking strategy
          console.warn(
            "Route has more than 25 stops. Using simplified directions."
          );

          // For this example, we'll just use direct lines as a fallback
          routeGeometry = {
            type: "LineString",
            coordinates: coordinates,
          };
        }

        if (routeGeometry && map.current) {
          // Add the route line using the directions geometry
          map.current.addSource("route-source", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: routeGeometry,
            },
          });

          map.current.addLayer({
            id: "route-line",
            type: "line",
            source: "route-source",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#3b82f6",
              "line-width": 4,
            },
          });
        }

        // Fit map to the bounds of all stops with padding
        if (reorderedStops.length > 0 && map.current) {
          map.current.fitBounds(newBounds, {
            padding: 50,
            maxZoom: 15,
          });
        }
      } catch (error) {
        console.error("Error updating map:", error);
      } finally {
        setIsLoading(false);
      }
    }

    updateMap();
  }, [route, styleLoaded]);

  return (
    <div className="flex flex-col w-full">
      <h2 className="text-xl font-semibold mb-4 text-blue-800">
        Route Map: {route.name}
      </h2>
      <div
        ref={mapContainer}
        className="relative h-96 w-full rounded-lg shadow-md"
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
            <div className="text-blue-600 font-medium">
              Loading route directions...
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-700">
        {route.description && (
          <p className="mb-2">
            <span className="font-medium">Description:</span>{" "}
            {route.description}
          </p>
        )}
        <p>
          <span className="font-medium">Total Stops:</span>{" "}
          {route.routeStops.length}
        </p>
      </div>
    </div>
  );
};
