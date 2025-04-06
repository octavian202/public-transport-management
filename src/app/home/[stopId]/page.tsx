"use client";

import React, { useEffect } from "react";

import { getUpcomingTripsData, getUpcomingTripsForStop } from "./actions";
import { usePathname } from "next/navigation";

export type TripsData = {
  id: string;
  routeName: string;
  departureTime: Date;
  arrivalTime: Date;
  vehicleType: string;
  occupancyData: {
    timestamp: Date;
    percentage: number;
    seated: number;
    standing: number;
  }[];
  capacity: number;
  // occupancyPrediction?: number;
}[];

export default function HomePage() {
  // sa selecteze o statie si sa vada busurile care vin si cat de ocupate sunt
  // search bar - normal
  // ruta, timpul in care ajunge, timp / delay, occupancy, locuri de stat jos, locuri de stat in picioare
  // + prezicere la occupancy data cand ajunge la tine

  // ar trebui luate numa busurile care urmeaza sa vina in urmatoarea ora (sau ceva timp)

  // cauti in timetable entry ce busuri vin in timp si de acolo iei rutele
  // tot de aici iei si tripurile care merg pe acolo in timp
  // iei occupancy data de la tripuri

  const [search, setSearch] = React.useState<string>("");
  const [tripsData, setTripsData] = React.useState<TripsData>([]);
  const [filteredTrips, setFilteredTrips] = React.useState<TripsData>([]);

  const pathname = usePathname();
  const stopId = pathname.split("/").pop() as string;

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getUpcomingTripsForStop(stopId);
        setTripsData(data);
      } catch (error) {
        console.error("Error fetching timetable entries:", error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (filteredTrips.length === 0) {
      setFilteredTrips([]);
      return;
    }
    const filteredTripsData = tripsData.filter((trip) => {
      return trip.routeName.toLowerCase().includes(search.toLowerCase());
    });

    setFilteredTrips(filteredTripsData);
  }, [tripsData, search]);

  console.log(filteredTrips);

  return (
    <div>
      {/* // search bar */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search for a route..."
        className="border border-gray-300 rounded p-2"
      />
      <ul className="mt-4">
        {tripsData.length === 0 && (
          <li className="text-gray-500">No trips found.</li>
        )}
        {tripsData.length > 0 &&
          tripsData.map((trip) => {
            if (trip === null) {
              return null; // Skip this entry if no trips are found
            }
            return (
              <li key={trip.id} className="border-b py-2">
                <div className="flex justify-between">
                  <span>{trip.routeName}</span>
                  <span>
                    {/* // should display the difference between now and the arrival time in minutes */}
                    arriving in{" "}
                    {(trip.arrivalTime.getTime() - Date.now()) * 1000 * 60}{" "}
                    minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Vehicle Type: {trip.vehicleType}</span>
                  <span>Capacity: {trip.capacity}</span>
                  <span>Sitting seats: {trip.occupancyData.pop()?.seated}</span>
                  <span>
                    Standing seats: {trip.occupancyData.pop()?.standing}
                  </span>
                  <span>
                    Occupancy: {trip.occupancyData.pop()?.percentage}%
                  </span>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
