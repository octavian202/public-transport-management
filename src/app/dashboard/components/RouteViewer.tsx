"use client";

import React from "react";

// Define types for the props
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
  description: string | null; // Allow description to be null
  routeStops: RouteStop[];
}

interface RouteViewerProps {
  routes: Route[];
  selectedRoute: Route | null;
  onRouteSelect: (routeId: string) => void;
}

export function RouteViewer({
  routes,
  selectedRoute,
  onRouteSelect,
}: RouteViewerProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Route Viewer</h2>
      <div className="mt-4">
        <select
          onChange={(e) => onRouteSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        >
          <option value="">Select a route</option>
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.name}
            </option>
          ))}
        </select>
      </div>
      {selectedRoute && (
        <div className="mt-4">
          <h3 className="text-lg font-medium">{selectedRoute.name}</h3>
          <p className="text-sm text-gray-600">
            {selectedRoute.description || "No description available"}
          </p>
          <ul className="mt-2 space-y-2">
            {selectedRoute.routeStops.map((rs) => (
              <li key={rs.id} className="text-sm">
                {rs.stopOrder}. {rs.stop.name} (Lat: {rs.stop.latitude}, Lon:{" "}
                {rs.stop.longitude})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
