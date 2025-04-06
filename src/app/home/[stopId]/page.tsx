"use client";

import React, { useEffect } from "react";

import { formatHHMM, getUpcomingTripsData } from "./actions";
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

  const pathname = usePathname();
  const stopId = pathname.split("/").pop() as string;

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getUpcomingTripsData(stopId);
        setTripsData(data);
      } catch (error) {
        console.error("Error fetching timetable entries:", error);
      }
    }

    fetchData();
  }, []);

  console.log(tripsData);

  return (
    <div>
      // search bar
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search for a stop..."
        className="border border-gray-300 rounded p-2"
      />
      <ul className="mt-4">
        {tripsData.length === 0 && (
          <li className="text-gray-500">No timetable entries found.</li>
        )}
        {tripsData.length > 0 &&
          tripsData.map((trip) => (
            <li key={trip.id} className="border-b py-2">
              <div className="flex justify-between">
                <span>{trip.routeName}</span>
                <span>
                  {/* // should display the difference between now and the arrival time in minutes */}
                  {(trip.arrivalTime.getTime() - Date.now()) * 1000 * 60}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Vehicle Type: {trip.vehicleType}</span>
                <span>Occupancy: {}</span>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
