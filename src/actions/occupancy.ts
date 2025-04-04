"use server";

import { prisma } from "../lib/db";
import { revalidatePath } from "next/cache";

/**
 * Records new occupancy data for a specific trip.
 *
 * @param {FormData} formData - A FormData object containing `tripId`, `count`, and `vehicleCapacity`.
 * @returns {Promise<{ success: boolean; data?: any; error?: string }>} A result object with success status, data, or an error message.
 */
export async function recordOccupancy(
  formData: FormData
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const tripId = formData.get("tripId") as string | null;
    const count = parseInt(formData.get("count") as string, 10);
    const vehicleCapacity = parseInt(
      formData.get("vehicleCapacity") as string,
      10
    );

    if (!tripId || isNaN(count) || isNaN(vehicleCapacity)) {
      return { success: false, error: "Invalid input data" };
    }

    const percentage = (count / vehicleCapacity) * 100;

    const occupancyRecord = await prisma.occupancyData.create({
      data: {
        tripId,
        timestamp: new Date(),
        count,
        percentage,
      },
    });

    return { success: true, data: occupancyRecord };
  } catch (error) {
    console.error("Failed to record occupancy:", error);
    return { success: false, error: "Failed to record occupancy data" };
  }
}

/**
 * Retrieves occupancy data for a specific trip.
 *
 * @param {string} tripId - The ID of the trip to retrieve occupancy data for.
 * @returns {Promise<{ success: boolean; data?: any; error?: string }>} The result object with the occupancy data or an error.
 */
export async function getTripOccupancy(
  tripId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const data = await prisma.occupancyData.findMany({
      where: { tripId },
      orderBy: { timestamp: "asc" },
    });

    return { success: true, data };
  } catch (error) {
    console.error(`Failed to fetch occupancy for trip ID ${tripId}:`, error);
    return { success: false, error: "Failed to fetch occupancy data" };
  }
}

/**
 * Retrieves historical occupancy data for all trips of a route between two dates.
 *
 * @param {string} routeId - The ID of the route.
 * @param {string} startDate - The start date in ISO format (YYYY-MM-DD).
 * @param {string} endDate - The end date in ISO format (YYYY-MM-DD).
 * @returns {Promise<{ success: boolean; data?: any; error?: string }>} Result with occupancy data or error.
 */
export async function getRouteOccupancy(
  routeId: string,
  startDate: string,
  endDate: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const data = await prisma.trip.findMany({
      where: {
        routeId,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        occupancyData: {
          orderBy: {
            timestamp: "asc",
          },
        },
        vehicle: {
          select: {
            capacity: true,
          },
        },
      },
    });

    return { success: true, data };
  } catch (error) {
    console.error(`Failed to fetch occupancy for route ID ${routeId}:`, error);
    return { success: false, error: "Failed to fetch route occupancy data" };
  }
}

/**
 * Calculates the average occupancy percentage per hour across trips for a given route and time range.
 *
 * @param {string} routeId - The ID of the route.
 * @param {string} startDate - The start date in ISO format (YYYY-MM-DD).
 * @param {string} endDate - The end date in ISO format (YYYY-MM-DD).
 * @returns {Promise<{ success: boolean; data?: Array<{ hour: number; averageOccupancy: number }>; error?: string }>} An array of hourly averages or an error.
 */
export async function getRouteOccupancyByHour(
  routeId: string,
  startDate: string,
  endDate: string
): Promise<{
  success: boolean;
  data?: Array<{ hour: number; averageOccupancy: number }>;
  error?: string;
}> {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const trips = await prisma.trip.findMany({
      where: {
        routeId,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        occupancyData: true,
      },
    });

    const hourlyData: Record<number, { sum: number; count: number }> = {};

    trips.forEach((trip) => {
      trip.occupancyData.forEach((data) => {
        const hour = data.timestamp.getHours();
        if (!hourlyData[hour]) {
          hourlyData[hour] = { sum: 0, count: 0 };
        }

        hourlyData[hour].sum += data.percentage;
        hourlyData[hour].count += 1;
      });
    });

    const result = [];
    for (let hour = 0; hour < 24; hour++) {
      const data = hourlyData[hour] || { sum: 0, count: 0 };
      const average = data.count > 0 ? data.sum / data.count : 0;

      result.push({
        hour,
        averageOccupancy: parseFloat(average.toFixed(2)),
      });
    }

    return { success: true, data: result };
  } catch (error) {
    console.error(
      `Failed to fetch hourly occupancy for route ID ${routeId}:`,
      error
    );
    return { success: false, error: "Failed to fetch hourly occupancy data" };
  }
}

/**
 * Fetches and transforms occupancy data for heatmap visualization by route and date range.
 *
 * @param {string} routeId - The ID of the route.
 * @param {string} startDate - The start date in ISO format (YYYY-MM-DD).
 * @param {string} endDate - The end date in ISO format (YYYY-MM-DD).
 * @returns {Promise<{ success: boolean; data?: Array<{ time: Date; stopName: string; occupancy: number }>; error?: string }>} Heatmap data or error.
 */
export async function getHeatmapData(
  routeId: string,
  startDate: string,
  endDate: string
): Promise<{
  success: boolean;
  data?: Array<{ time: Date; stopName: string; occupancy: number }>;
  error?: string;
}> {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const trips = await prisma.trip.findMany({
      where: {
        routeId,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        occupancyData: true,
        route: {
          include: {
            routeStops: {
              include: {
                stop: true,
              },
              orderBy: {
                stopOrder: "asc",
              },
            },
          },
        },
      },
    });

    const heatmapData: Array<{
      time: Date;
      stopName: string;
      occupancy: number;
    }> = [];

    trips.forEach((trip) => {
      const stops = trip.route.routeStops.map((rs) => rs.stop);
      const stopCount = stops.length;

      trip.occupancyData.forEach((data) => {
        const tripProgress =
          (data.timestamp.getTime() - trip.departureTime.getTime()) /
          (trip.arrivalTime.getTime() - trip.departureTime.getTime());

        const stopIndex = Math.min(
          Math.floor(tripProgress * stopCount),
          stopCount - 1
        );

        heatmapData.push({
          time: data.timestamp,
          stopName: stops[stopIndex].name,
          occupancy: data.percentage,
        });
      });
    });

    return { success: true, data: heatmapData };
  } catch (error) {
    console.error(
      `Failed to fetch heatmap data for route ID ${routeId}:`,
      error
    );
    return { success: false, error: "Failed to fetch heatmap data" };
  }
}
