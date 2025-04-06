"use server";

import { prisma } from "@/lib/prisma";
import { TripsData } from "./page";

export function formatHHMM(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export async function getUpcomingTripsData(stopId: string): Promise<TripsData> {
  const now = new Date(); // Get the current date and time

  // Calculate time range: now and 1 hour after now

  const oneHourAfter = new Date(now.getTime() + 60 * 60 * 1000);

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

  try {
    const result = await prisma.timetableEntry.findMany({
      where: {
        // Combine all conditions using AND (implicitly for top-level, explicitly if needed)
        AND: [
          // 1. Filter by the specific Stop ID
          { stopId: stopId },

          // 2. Filter by the correct day type (Weekday/Weekend)
          isTodayWeekday ? { isWeekday: true } : { isWeekend: true },
          // 3. Filter out entries specifically for holidays (adjust if needed)
          { isHoliday: false },

          // 4. Filter by validity dates (optional but recommended)
          //    - Entry should have started (validFrom is null or in the past)
          {
            OR: [{ validFrom: null }, { validFrom: { lte: now } }],
          },
          //    - Entry should not have expired (validUntil is null or in the future)
          {
            OR: [{ validUntil: null }, { validUntil: { gte: now } }],
          },

          // 5. Apply the calculated time filter (handles midnight wrap-around)
          timeFilter,
        ],
      },
      include: {
        route: true,
        trips: {
          include: {
            occupancyData: true, // Include occupancy data if needed
          },
        },
      },
      orderBy: {
        // Optional: Order the results by departure time
        departureTime: "asc",
      },
      // Optional: Include related data if needed
      // include: {
      //   route: true,
      // }
    });

    console.log(
      `Found ${result.length} entries for stop ${stopId} within 1 hour.`
    );

    // console.log(result);

    result.map((timetableEntry) => console.log(timetableEntry));

    if (result.length === 0) {
      console.log(`No timetable entries found for stop ${stopId}`);
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
