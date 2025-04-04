"use server";

import { prisma } from "../lib/db";
import { revalidatePath } from "next/cache";

/**
 * Get all vehicles with basic information
 */
export async function getAllVehicles(): Promise<
  {
    id: string;
    type: string;
    capacity: number;
    features: string | null;
  }[]
> {
  try {
    return await prisma.vehicle.findMany({
      select: {
        id: true,
        type: true,
        capacity: true,
        features: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch vehicles:", error);
    throw new Error("Failed to fetch vehicles");
  }
}

/**
 * Get detailed information about a specific vehicle
 */
export async function getVehicleDetails(vehicleId: string): Promise<any> {
  try {
    return await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        trips: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          include: {
            route: true,
          },
          orderBy: {
            departureTime: "asc",
          },
          take: 10, // Limit to upcoming trips
        },
      },
    });
  } catch (error) {
    console.error(
      `Failed to fetch vehicle details for ID ${vehicleId}:`,
      error
    );
    throw new Error("Failed to fetch vehicle details");
  }
}

/**
 * Create a new vehicle
 */
export async function createVehicle(
  formData: FormData
): Promise<{ success: boolean; vehicle?: any; error?: string }> {
  try {
    // Extract data from formData
    const type = formData.get("type") as string | null;
    const capacity = parseInt(formData.get("capacity") as string, 10);
    const features = formData.get("features") as string | null;

    // Validate data
    if (!type || isNaN(capacity)) {
      return {
        success: false,
        error: "Vehicle type and capacity are required",
      };
    }

    // Create the vehicle
    const newVehicle = await prisma.vehicle.create({
      data: {
        type,
        capacity,
        features,
      },
    });

    // Revalidate the vehicles list
    revalidatePath("/vehicles");

    return { success: true, vehicle: newVehicle };
  } catch (error) {
    console.error("Failed to create vehicle:", error);
    return { success: false, error: "Failed to create vehicle" };
  }
}

/**
 * Update a vehicle
 */
export async function updateVehicle(
  vehicleId: string,
  formData: FormData
): Promise<{ success: boolean; vehicle?: any; error?: string }> {
  try {
    // Extract data from formData
    const type = formData.get("type") as string | null;
    const capacity = parseInt(formData.get("capacity") as string, 10);
    const features = formData.get("features") as string | null;

    // Validate data
    if (!type || isNaN(capacity)) {
      return {
        success: false,
        error: "Vehicle type and capacity are required",
      };
    }

    // Update the vehicle
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        type,
        capacity,
        features,
      },
    });

    // Revalidate the vehicle details page
    revalidatePath(`/vehicles/${vehicleId}`);

    return { success: true, vehicle: updatedVehicle };
  } catch (error) {
    console.error(`Failed to update vehicle ID ${vehicleId}:`, error);
    return { success: false, error: "Failed to update vehicle" };
  }
}

/**
 * Delete a vehicle
 */
export async function deleteVehicle(
  vehicleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    // Revalidate the vehicles list
    revalidatePath("/vehicles");

    return { success: true };
  } catch (error) {
    console.error(`Failed to delete vehicle ID ${vehicleId}:`, error);
    return { success: false, error: "Failed to delete vehicle" };
  }
}
