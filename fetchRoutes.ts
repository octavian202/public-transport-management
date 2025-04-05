import axios from "axios";
import { PrismaClient } from "@prisma/client";
const ProgressBar = require("progress");

const prisma = new PrismaClient();
const API_KEY = "bYxNFJQzxCkEuuGalKMynFhFYKEzbxGYYBY3HaLE";
const API_BASE = "https://api.tranzy.ai/v1/opendata";

// Helper functions for data generation
const randomElement = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const vehicleTypeMap: { [key: number]: string } = {
  0: "Tram",
  1: "Subway",
  2: "Rail",
  3: "Bus",
  4: "Ferry",
  5: "Cable tram",
  6: "Aerial lift",
  7: "Funicular",
  11: "Trolleybus",
  12: "Monorail",
};

const daysOfWeek = Array.from({ length: 7 }, (_, i) => i);

async function fetchData<T>(url: string, agencyId?: string): Promise<T> {
  const headers = {
    "X-API-KEY": API_KEY,
    ...(agencyId && { "X-Agency-Id": agencyId }),
  };

  const response = await axios.get<T>(url, { headers });
  return response.data;
}

async function main() {
  const bar = new ProgressBar(
    "Seeding database [:bar] :percent :etas remaining",
    {
      total: 8,
      width: 40,
    }
  );

  const agencyId = "2";

  // Step 2: Fetch and create routes
  bar.tick(1, { message: "Fetching routes" });
  const routesData = await fetchData<
    Array<{
      route_id: string;
      route_short_name: string;
      route_long_name: string;
      route_type: number;
    }>
  >(`${API_BASE}/routes`, agencyId);

  const createdRoutes = await Promise.all(
    routesData.map((route) =>
      prisma.route.create({
        data: {
          name: route.route_short_name,
          description: route.route_long_name,
          operatingHours: `${randomBetween(5, 7)}:00 AM - ${randomBetween(
            21,
            23
          )}:00 PM`,
        },
      })
    )
  );

  // Step 3: Fetch and create stops
  bar.tick(1, { message: "Fetching stops" });
  const stopsData = await fetchData<
    Array<{
      stop_id: string;
      stop_name: string;
      stop_lat: number;
      stop_lon: number;
    }>
  >(`${API_BASE}/stops`, agencyId);

  const createdStops = await Promise.all(
    stopsData.map((stop) =>
      prisma.stop.create({
        data: {
          name: stop.stop_name,
          latitude: stop.stop_lat,
          longitude: stop.stop_lon,
          accessibility: randomElement(["Elevator", "Ramp", "None"]),
        },
      })
    )
  );

  // Step 4: Create route stops
  bar.tick(1, { message: "Creating route stops" });
  for (const [idx, route] of createdRoutes.entries()) {
    const selectedStops = createdStops.slice(0, randomBetween(5, 15));

    await Promise.all(
      selectedStops.map((stop, order) =>
        prisma.routeStop.create({
          data: {
            routeId: route.id,
            stopId: stop.id,
            stopOrder: order,
          },
        })
      )
    );
  }

  // Step 5: Create timetable entries
  bar.tick(1, { message: "Creating timetable entries" });
  const timetableEntries = [];
  for (const route of createdRoutes) {
    const routeStops = await prisma.routeStop.findMany({
      where: { routeId: route.id },
      include: { stop: true },
    });

    for (const routeStop of routeStops) {
      for (let dayOfWeek of daysOfWeek) {
        timetableEntries.push(
          prisma.timetableEntry.create({
            data: {
              routeId: route.id,
              stopId: routeStop.stopId,
              dayOfWeek,
              departureTime: `${randomBetween(5, 23)
                .toString()
                .padStart(2, "0")}:${randomElement(["00", "15", "30", "45"])}`,
              isHoliday: false,
              isWeekday: dayOfWeek < 5,
              isWeekend: dayOfWeek >= 5,
            },
          })
        );
      }
    }
  }
  await Promise.all(timetableEntries);

  // Step 6: Create trips
  bar.tick(1, { message: "Creating trips" });
  const trips = [];
  const tripDate = new Date();
  for (const entry of await prisma.timetableEntry.findMany()) {
    const departureTime = new Date(tripDate);
    const [hours, minutes] = entry.departureTime.split(":");
    departureTime.setHours(parseInt(hours), parseInt(minutes));

    const arrivalTime = new Date(departureTime);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + randomBetween(15, 45));

    trips.push(
      prisma.trip.create({
        data: {
          routeId: entry.routeId,
          timetableEntryId: entry.id,
          vehicleType:
            vehicleTypeMap[
              routesData.find((r) => r.route_id === entry.routeId)
                ?.route_type || 3
            ],
          capacity: randomBetween(20, 100),
          date: departureTime,
          departureTime: departureTime,
          arrivalTime: arrivalTime,
          status: randomElement(["Scheduled", "Active", "Completed"]),
        },
      })
    );
  }
  const createdTrips = await Promise.all(trips);

  // Step 7: Generate occupancy data
  bar.tick(1, { message: "Generating occupancy data" });
  const occupancyPromises = [];
  for (const trip of createdTrips) {
    const baseHour = trip.departureTime.getHours();
    const isRushHour =
      (baseHour >= 7 && baseHour <= 9) || (baseHour >= 16 && baseHour <= 18);

    let currentTime = new Date(trip.departureTime);
    while (currentTime < trip.arrivalTime) {
      const maxOccupancy = isRushHour
        ? randomBetween(75, 95)
        : randomBetween(20, 60);
      const count = Math.floor((maxOccupancy / 100) * trip.capacity);

      occupancyPromises.push(
        prisma.occupancyData.create({
          data: {
            tripId: trip.id,
            timestamp: currentTime,
            count,
            percentage: (count / trip.capacity) * 100,
            seated: Math.floor(count * 0.7),
            standing: Math.ceil(count * 0.3),
            capacity: trip.capacity,
          },
        })
      );

      currentTime = new Date(currentTime.getTime() + 5 * 60000); // Add 5 minutes
    }
  }
  await Promise.all(occupancyPromises);

  bar.tick(1, { message: "Database seeding complete!" });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
