"use client";

import React, { useState, useEffect } from "react";
import { MapboxMap } from "./components/MapboxMap";
import { RouteViewer } from "./components/RouteViewer";
import { AISuggestions } from "./components/AISuggestions";
import { ReportGenerator } from "./components/ReportGenerator";
import { FleetManagement } from "./components/FleetManagement";
import { AddRoute } from "./components/AddRoute";
import AdminHeader from "@/components/AdminHeader";
import { fetchRoutes, fetchRouteDetails, acceptSuggestion } from "./actions";
import { toast } from "sonner";

// Define types based on Prisma schema
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

interface RouteDetails extends Route {
  trips: {
    id: string;
    vehicleType: string;
    status: string;
    departureTime: Date;
    arrivalTime: Date;
  }[];
}

export default function Dashboard() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteDetails | null>(null);
  const [activeSection, setActiveSection] = useState<
    "routes" | "map" | "suggestions" | "reports" | "fleet" | "add route"
  >("routes");

  useEffect(() => {
    // Fetch all routes on initial load
    async function loadRoutes() {
      try {
        const data = await fetchRoutes();
        setRoutes(data as Route[]);
      } catch (error) {
        toast.error("Failed to load routes" + error);
      }
    }
    loadRoutes();
  }, []);

  const handleRouteSelect = async (routeId: string) => {
    try {
      const routeDetails = await fetchRouteDetails(routeId);
      setSelectedRoute(routeDetails);

      // Automatically switch to map view when a route is selected
      if (activeSection === "routes") {
        setActiveSection("map");
      }
    } catch (error) {
      toast.error("Failed to load route details" + error);
    }
  };

  const handleAcceptSuggestion = async (suggestionId: string) => {
    try {
      await acceptSuggestion(suggestionId);
      toast.success("Suggestion accepted and route updated");
      // Refresh route details
      if (selectedRoute) {
        const updatedRoute = await fetchRouteDetails(selectedRoute.id);
        setSelectedRoute(updatedRoute);
      }
    } catch (error) {
      toast.error("Failed to accept suggestion" + error);
    }
  };

  // Determine if we should use the full-width layout
  const isMapView = activeSection === "map" && selectedRoute;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <AdminHeader />
      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-8">
        <div className="flex justify-center">
          <div className="text-3xl font-bold text-blue-800 flex items-center">
            Dashboard
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 flex justify-center space-x-4 w-full overflow-x-auto px-4">
        {["routes", "map", "suggestions", "reports", "fleet", "add route"].map(
          (section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section as typeof activeSection)}
              className={`px-4 py-2 cursor rounded-md text-sm font-medium ${
                activeSection === section
                  ? "bg-blue-800 text-white"
                  : "bg-white text-blue-800 hover:bg-blue-100"
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          )
        )}
      </nav>

      {/* Main Content */}
      <div
        className={`mt-6 mx-auto w-full ${
          isMapView ? "max-w-6xl" : "max-w-4xl"
        } px-4`}
      >
        <div className="bg-white py-6 px-4 shadow sm:rounded-lg sm:px-6">
          {activeSection === "routes" && (
            <RouteViewer
              routes={routes}
              selectedRoute={selectedRoute}
              onRouteSelect={handleRouteSelect}
            />
          )}
          {activeSection === "map" && selectedRoute && (
            <MapboxMap route={selectedRoute} />
          )}
          {activeSection === "suggestions" && selectedRoute && (
            <AISuggestions
              routeId={selectedRoute.id}
              onAccept={handleAcceptSuggestion}
            />
          )}
          {activeSection === "reports" && <ReportGenerator routes={routes} />}
          {activeSection === "fleet" && <FleetManagement />}
          {activeSection === "add route" && <AddRoute />}
        </div>
      </div>
    </div>
  );
}
