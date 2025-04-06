"use server";

import { prisma } from "@/lib/prisma";
import { TripsData } from "./page";

export async function getUpcomingTripsData(stopId: string): Promise<TripsData> {
  function formatHHMM(date: Date): string {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const now = new Date(); // Get the current date and time

  // Calculate time range: now and 1 hour after now

  const oneHourAfter = new Date(now.getTime() + 60 * 60 * 1000);

  console.log(oneHourAfter);

  // Format times into HH:MM strings
  const nowHHMM = formatHHMM(now);
  const oneHourAfterHHMM = formatHHMM(oneHourAfter);

  // Determine if today is a weekday or weekend
  // Sunday = 0, Monday = 1, ..., Saturday = 6
  const dayOfWeek = now.getDay();
  const isTodayWeekday = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday

  // --- Build the core time filter ---
  // This handles the midnight wrap-around case
  let timeFilter;
  if (nowHHMM <= oneHourAfterHHMM) {
    // Normal case: The time range doesn't cross midnight (e.g., 09:00 to 11:00)
    timeFilter = {
      departureTime: {
        gte: nowHHMM,
        lte: oneHourAfterHHMM,
      },
    };
  } else {
    // Wrap-around case: The time range crosses midnight (e.g., 23:30 to 01:30)
    timeFilter = {
      OR: [
        { departureTime: { gte: nowHHMM } }, // Times from 1hr before until 23:59
        { departureTime: { lte: oneHourAfterHHMM } }, // Times from 00:00 until 1hr after
      ],
    };
  }

  let weekdayFilter;
  if (isTodayWeekday) {
    weekdayFilter = {
      isWeekday: true,
    };
  } else {
    weekdayFilter = {
      isWeekend: true,
    };
  }

  try {
    // const result = await prisma.trip.findMany({
    //   where: {
    //     ...timeFilter,
    //     timetableEntry: {
    //       stopId: stopId,
    //       ...weekdayFilter,
    //     },
    //   },
    //   include: {
    //     route: true,
    //     occupancyData: true,
    //     timetableEntry: true,
    //   },
    //   orderBy: {
    //     departureTime: "asc",
    //   },
    // });

    const result = await prisma.timetableEntry.findMany({
      where: {
        stopId: stopId,
        ...weekdayFilter,
        ...timeFilter,
      },
      include: {
        route: true,
        trips: {
          include: {
            occupancyData: true,
          },
        },
      },
      orderBy: {
        departureTime: "asc",
      },
    });

    console.log(
      `Found ${result.length} entries for stop ${stopId} within 1 hour.`
    );

    console.log(result);

    result.map((timetableEntry) => console.log(timetableEntry));

    if (result.length === 0) {
      console.log(`No trips found for stop ${stopId}`);
      return []; // Return an empty array if no entries are found
    }

    const data = result.map((timetableEntry) => {
      if (timetableEntry.trips.length === 0) {
        console.log(
          `No trips found for timetable entry with ID ${timetableEntry.id}`
        );
        return null; // Skip this entry if no trips are found
      }
      const trip = timetableEntry.trips[0]; // Assuming you want the first trip for each entry
      return {
        id: trip.id,
        routeName: timetableEntry.route.name,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        vehicleType: trip.vehicleType,
        occupancyData: trip.occupancyData.map((data) => ({
          timestamp: data.timestamp,
          percentage: data.percentage,
          seated: data.seated,
          standing: data.standing,
        })),
        capacity: trip.capacity,
      };
    }) as TripsData;

    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching timetable entries:", error);
    throw error; // Re-throw the error for handling upstream
  }
}

export async function getUpcomingTripsForStop(
  stopId: string
): Promise<TripsData> {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const currentDay = now.getDay(); // 0 = Sun, 6 = Sat
  const isWeekday = currentDay >= 1 && currentDay <= 5;
  const isWeekend = currentDay === 0 || currentDay === 6;

  const timetableEntries = await prisma.timetableEntry.findMany({
    where: {
      stopId,
      OR: [{ isWeekday: isWeekday }, { isWeekend: isWeekend }],
    },
    select: {
      id: true,
      departureTime: true,
    },
  });

  const entryIdsInNextHour: string[] = [];

  for (const entry of timetableEntries) {
    const [hour, minute] = entry.departureTime.split(":").map(Number);
    const scheduledToday = new Date(now);
    scheduledToday.setHours(hour, minute, 0, 0);
    scheduledToday.setDate(now.getDate());
    scheduledToday.setMonth(now.getMonth());
    scheduledToday.setFullYear(now.getFullYear());

    if (scheduledToday >= now && scheduledToday <= oneHourLater) {
      // console.log(now, scheduledToday, oneHourLater);
      entryIdsInNextHour.push(entry.id);
    }
  }

  if (entryIdsInNextHour.length === 0) {
    return [];
  }

  console.log(entryIdsInNextHour);

  const trips = await prisma.trip.findMany({
    where: {
      timetableEntryId: { in: entryIdsInNextHour },
    },
    include: {
      timetableEntry: true,
      route: true,
      occupancyData: true,
    },
  });

  console.log(trips);

  const tripsData = trips.map((trip) => ({
    id: trip.id,
    routeName: trip.route.name,
    departureTime: trip.departureTime,
    arrivalTime: trip.arrivalTime,
    vehicleType: trip.vehicleType,
    occupancyData: trip.occupancyData.map((data) => ({
      timestamp: data.timestamp,
      percentage: data.percentage,
      seated: data.seated,
      standing: data.standing,
    })),
    capacity: trip.capacity,
  }));

  return tripsData;
}
