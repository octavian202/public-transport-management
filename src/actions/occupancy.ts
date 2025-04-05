"use server";

import { z } from "zod";
import { prisma } from "../lib/db";
import { revalidatePath } from "next/cache";

// ======= ZOD SCHEMAS =======

const OccupancyFormSchema = z.object({
  tripId: z.string().min(1),
  count: z.coerce.number().int().nonnegative(),
  vehicleCapacity: z.coerce.number().int().positive(),
});

const RouteQuerySchema = z.object({
  routeId: z.string().min(1),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date format",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date format",
  }),
});

// ======= FUNCTIONS =======

export async function recordOccupancy(
  formData: FormData
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const data = OccupancyFormSchema.safeParse({
      tripId: formData.get("tripId"),
      count: formData.get("count"),
      vehicleCapacity: formData.get("vehicleCapacity"),
    });

    if (!data.success) {
      return { success: false, error: "Invalid input data" };
    }

    const { tripId, count, vehicleCapacity } = data.data;
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

export async function getRouteOccupancy(
  routeId: string,
  startDate: string,
  endDate: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const parsed = RouteQuerySchema.safeParse({ routeId, startDate, endDate });
    if (!parsed.success) {
      return { success: false, error: "Invalid route or date range" };
    }

    const { startDate: start, endDate: end } = parsed.data;

    const data = await prisma.trip.findMany({
      where: {
        routeId,
        date: {
          gte: new Date(start),
          lte: new Date(end),
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
    const parsed = RouteQuerySchema.safeParse({ routeId, startDate, endDate });
    if (!parsed.success) {
      return { success: false, error: "Invalid input parameters" };
    }

    const { startDate: start, endDate: end } = parsed.data;

    const trips = await prisma.trip.findMany({
      where: {
        routeId,
        date: {
          gte: new Date(start),
          lte: new Date(end),
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
    const parsed = RouteQuerySchema.safeParse({ routeId, startDate, endDate });
    if (!parsed.success) {
      return { success: false, error: "Invalid input parameters" };
    }

    const { startDate: start, endDate: end } = parsed.data;

    const trips = await prisma.trip.findMany({
      where: {
        routeId,
        date: {
          gte: new Date(start),
          lte: new Date(end),
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
