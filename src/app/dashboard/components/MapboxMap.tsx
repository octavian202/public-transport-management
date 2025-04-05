"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface RouteStop {
  id: string;
  stopOrder: number;
  stop: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  };
}

interface Route {
  id: string;
  name: string;
  description: string | null;
  routeStops: RouteStop[];
}

interface MapboxMapProps {
  route: Route | null;
}

export function MapboxMap({ route }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !route) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [
        route.routeStops[0].stop.longitude,
        route.routeStops[0].stop.latitude,
      ],
      zoom: 12,
    });

    route.routeStops.forEach((rs) => {
      new mapboxgl.Marker()
        .setLngLat([rs.stop.longitude, rs.stop.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${rs.stop.name}</h3>`))
        .addTo(map.current!);
    });

    const coordinates = route.routeStops.map((rs) => [
      rs.stop.longitude,
      rs.stop.latitude,
    ]);
    map.current.on("load", () => {
      map.current!.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates },
        },
      });
      map.current!.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#888", "line-width": 8 },
      });
    });

    return () => map.current?.remove();
  }, [route]);

  return <div ref={mapContainer} className="h-96 w-full mt-4" />;
}
