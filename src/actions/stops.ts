"use server";

import { prisma } from "../lib/db";
import { revalidatePath } from "next/cache";

/**
 * Get all stops with basic information
 */
export async function getAllStops(): Promise<
  {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    accessibility: string | null;
  }[]
> {
  try {
    return await prisma.stop.findMany({
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        accessibility: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch stops:", error);
    throw new Error("Failed to fetch stops");
  }
}

/**
 * Get detailed information about a specific stop
 */
export async function getStopDetails(stopId: string): Promise<any> {
  try {
    return await prisma.stop.findUnique({
      where: { id: stopId },
      include: {
        RouteStop: {
          include: {
            route: true,
          },
        },
      },
    });
  } catch (error) {
    console.error(`Failed to fetch stop details for ID ${stopId}:`, error);
    throw new Error("Failed to fetch stop details");
  }
}

/**
 * Create a new stop
 */
export async function createStop(
  formData: FormData
): Promise<{ success: boolean; stop?: any; error?: string }> {
  try {
    // Extract data from formData
    const name = formData.get("name") as string | null;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    const accessibility = formData.get("accessibility") as string | null;

    // Validate data
    if (!name || isNaN(latitude) || isNaN(longitude)) {
      return {
        success: false,
        error: "Stop name, latitude, and longitude are required",
      };
    }

    // Create the stop
    const newStop = await prisma.stop.create({
      data: {
        name,
        latitude,
        longitude,
        accessibility,
      },
    });

    // Revalidate the stops list
    revalidatePath("/stops");

    return { success: true, stop: newStop };
  } catch (error) {
    console.error("Failed to create stop:", error);
    return { success: false, error: "Failed to create stop" };
  }
}

/**
 * Update a stop
 */
export async function updateStop(
  stopId: string,
  formData: FormData
): Promise<{ success: boolean; stop?: any; error?: string }> {
  try {
    // Extract data from formData
    const name = formData.get("name") as string | null;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    const accessibility = formData.get("accessibility") as string | null;

    // Validate data
    if (!name || isNaN(latitude) || isNaN(longitude)) {
      return {
        success: false,
        error: "Stop name, latitude, and longitude are required",
      };
    }

    // Update the stop
    const updatedStop = await prisma.stop.update({
      where: { id: stopId },
      data: {
        name,
        latitude,
        longitude,
        accessibility,
      },
    });

    // Revalidate the stop details page
    revalidatePath(`/stops/${stopId}`);

    return { success: true, stop: updatedStop };
  } catch (error) {
    console.error(`Failed to update stop ID ${stopId}:`, error);
    return { success: false, error: "Failed to update stop" };
  }
}

/**
 * Delete a stop
 */
export async function deleteStop(
  stopId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.stop.delete({
      where: { id: stopId },
    });

    // Revalidate the stops list
    revalidatePath("/stops");

    return { success: true };
  } catch (error) {
    console.error(`Failed to delete stop ID ${stopId}:`, error);
    return { success: false, error: "Failed to delete stop" };
  }
}

/**
 * Get stops for a specific route
 */
export async function getRouteStops(routeId: string): Promise<any> {
  try {
    const routeStops = await prisma.routeStop.findMany({
      where: { routeId },
      include: {
        stop: true,
      },
      orderBy: {
        stopOrder: "asc",
      },
    });

    return routeStops.map((rs) => rs.stop);
  } catch (error) {
    console.error(`Failed to fetch stops for route ID ${routeId}:`, error);
    throw new Error("Failed to fetch route stops");
  }
}

/**
 * Get nearby stops based on coordinates
 */
export async function getNearbyStops(
  latitude: number,
  longitude: number,
  radiusInKm: number = 2
): Promise<{ success: boolean; stops?: any[]; error?: string }> {
  try {
    // Get all stops
    const allStops = await prisma.stop.findMany();

    // Filter stops within the specified radius
    const nearbyStops = allStops.filter((stop) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        stop.latitude,
        stop.longitude
      );
      return distance <= radiusInKm;
    });

    return { success: true, stops: nearbyStops };
  } catch (error) {
    console.error("Failed to fetch nearby stops:", error);
    return { success: false, error: "Failed to fetch nearby stops" };
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}
