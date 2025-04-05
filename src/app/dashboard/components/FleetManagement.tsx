"use client";

import React, { useState, useEffect } from "react";
import { prisma } from "@/lib/prisma";

// Define the type for a trip
interface Trip {
  id: string;
  vehicleType: string;
  status: string;
  routeId: string;
}

export function FleetManagement() {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    async function fetchTrips() {
      const data: Trip[] = await prisma.trip.findMany({
        select: { id: true, vehicleType: true, status: true, routeId: true },
      });
      setTrips(data);
    }
    fetchTrips();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Fleet Management</h2>
      <ul className="mt-4 space-y-2">
        {trips.map((trip) => (
          <li key={trip.id} className="border p-2 rounded-md">
            <p>Vehicle: {trip.vehicleType}</p>
            <p>Status: {trip.status}</p>
            <p>Route ID: {trip.routeId}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
