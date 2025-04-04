"use server";

import { prisma } from "../lib/db";
import { revalidatePath } from "next/cache";

/**
 * Retrieves all routes with basic information.
 *
 * @returns {Promise<Array<{id: string, name: string, description: string | null, operatingHours: string | null}>>}
 * A promise that resolves to an array of route objects containing id, name, description, and operatingHours.
 *
 * @throws {Error} Throws an error if the database query fails.
 *
 * @example
 * ```typescript
 * const routes = await getAllRoutes();
 * console.log(`Found ${routes.length} routes`);
 * routes.forEach(route => console.log(`${route.id}: ${route.name}`));
 * ```
 */
export async function getAllRoutes(): Promise<
  {
    id: string;
    name: string;
    description: string | null;
    operatingHours: string | null;
  }[]
> {
  try {
    return await prisma.route.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        operatingHours: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch routes:", error);
    throw new Error("Failed to fetch routes");
  }
}

/**
 * Retrieves detailed information about a specific route, including stops and upcoming trips.
 *
 * @param {string} routeId - The unique identifier of the route to retrieve.
 *
 * @returns {Promise<any>} A promise that resolves to the route object with related stops and trips.
 * The returned object includes:
 * - Basic route details (id, name, description, operatingHours)
 * - Associated stops in order
 * - Upcoming trips (limited to 10) with vehicle information
 *
 * @throws {Error} Throws an error if the route cannot be found or if the database query fails.
 *
 * @example
 * ```typescript
 * try {
 *   const routeDetails = await getRouteDetails('route-123');
 *   console.log(`Route: ${routeDetails.name}`);
 *   console.log(`Stops: ${routeDetails.routeStops.length}`);
 *   console.log(`Upcoming trips: ${routeDetails.trips.length}`);
 * } catch (error) {
 *   console.error('Error fetching route details:', error);
 * }
 * ```
 */
export async function getRouteDetails(routeId: string): Promise<any> {
  try {
    return await prisma.route.findUnique({
      where: { id: routeId },
      include: {
        routeStops: {
          include: {
            stop: true,
          },
          orderBy: {
            stopOrder: "asc",
          },
        },
        trips: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          include: {
            vehicle: true,
          },
          orderBy: {
            departureTime: "asc",
          },
          take: 10, // Limit to upcoming trips
        },
      },
    });
  } catch (error) {
    console.error(`Failed to fetch route details for ID ${routeId}:`, error);
    throw new Error("Failed to fetch route details");
  }
}

/**
 * Creates a new transit route.
 *
 * @param {FormData} formData - Form data containing route details:
 *   - name: (string, required) The name of the route
 *   - description: (string, optional) A description of the route
 *   - operatingHours: (string, optional) The operating hours of the route
 *
 * @returns {Promise<{ success: boolean; route?: any; error?: string }>} A promise that resolves to:
 *   - success: Boolean indicating if the operation succeeded
 *   - route: The created route object (only present if success is true)
 *   - error: Error message (only present if success is false)
 *
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('name', 'Downtown Express');
 * formData.append('description', 'Express route through downtown');
 * formData.append('operatingHours', 'Mon-Fri: 6AM-10PM');
 *
 * const result = await createRoute(formData);
 *
 * if (result.success) {
 *   console.log('Route created:', result.route);
 * } else {
 *   console.error('Failed to create route:', result.error);
 * }
 * ```
 */
export async function createRoute(
  formData: FormData
): Promise<{ success: boolean; route?: any; error?: string }> {
  try {
    // Extract data from formData
    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const operatingHours = formData.get("operatingHours") as string | null;

    // Validate data
    if (!name) {
      return { success: false, error: "Route name is required" };
    }

    // Create the route
    const newRoute = await prisma.route.create({
      data: {
        name,
        description,
        operatingHours,
      },
    });

    // Revalidate the routes list
    revalidatePath("/routes");

    return { success: true, route: newRoute };
  } catch (error) {
    console.error("Failed to create route:", error);
    return { success: false, error: "Failed to create route" };
  }
}

/**
 * Updates an existing route with new information.
 *
 * @param {string} routeId - The unique identifier of the route to update.
 * @param {FormData} formData - Form data containing updated route details:
 *   - name: (string, required) The updated name of the route
 *   - description: (string, optional) The updated description of the route
 *   - operatingHours: (string, optional) The updated operating hours of the route
 *
 * @returns {Promise<{ success: boolean; route?: any; error?: string }>} A promise that resolves to:
 *   - success: Boolean indicating if the operation succeeded
 *   - route: The updated route object (only present if success is true)
 *   - error: Error message (only present if success is false)
 *
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('name', 'Downtown Express Updated');
 * formData.append('description', 'Updated express route through downtown');
 * formData.append('operatingHours', 'Mon-Fri: 5AM-11PM');
 *
 * const result = await updateRoute('route-123', formData);
 *
 * if (result.success) {
 *   console.log('Route updated:', result.route);
 * } else {
 *   console.error('Failed to update route:', result.error);
 * }
 * ```
 */
export async function updateRoute(
  routeId: string,
  formData: FormData
): Promise<{ success: boolean; route?: any; error?: string }> {
  try {
    // Extract data from formData
    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const operatingHours = formData.get("operatingHours") as string | null;

    // Validate data
    if (!name) {
      return { success: false, error: "Route name is required" };
    }

    // Update the route
    const updatedRoute = await prisma.route.update({
      where: { id: routeId },
      data: {
        name,
        description,
        operatingHours,
      },
    });

    // Revalidate the route details page
    revalidatePath(`/routes/${routeId}`);

    return { success: true, route: updatedRoute };
  } catch (error) {
    console.error(`Failed to update route ID ${routeId}:`, error);
    return { success: false, error: "Failed to update route" };
  }
}

/**
 * Updates the stops associated with a route and their ordering.
 * This operation replaces all existing stops with the new list of stops.
 *
 * @param {string} routeId - The unique identifier of the route whose stops are being updated.
 * @param {Array<{ stopId: string }>} stopsData - Array of stop objects, each containing a stopId.
 *   The order of stops in the array determines their sequence in the route.
 *
 * @returns {Promise<{ success: boolean; error?: string }>} A promise that resolves to:
 *   - success: Boolean indicating if the operation succeeded
 *   - error: Error message (only present if success is false)
 *
 * @example
 * ```typescript
 * const stopsData = [
 *   { stopId: 'stop-1' },
 *   { stopId: 'stop-2' },
 *   { stopId: 'stop-3' }
 * ];
 *
 * const result = await updateRouteStops('route-123', stopsData);
 *
 * if (result.success) {
 *   console.log('Route stops updated successfully');
 * } else {
 *   console.error('Failed to update route stops:', result.error);
 * }
 * ```
 */
export async function updateRouteStops(
  routeId: string,
  stopsData: { stopId: string }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Start a transaction for atomicity
    await prisma.$transaction(async (tx) => {
      // Delete all existing route stops
      await tx.routeStop.deleteMany({
        where: { routeId },
      });

      // Create new route stops with the updated information
      for (let i = 0; i < stopsData.length; i++) {
        await tx.routeStop.create({
          data: {
            routeId,
            stopId: stopsData[i].stopId,
            stopOrder: i + 1,
          },
        });
      }
    });

    // Revalidate the route details page
    revalidatePath(`/routes/${routeId}`);

    return { success: true };
  } catch (error) {
    console.error(`Failed to update stops for route ID ${routeId}:`, error);
    return { success: false, error: "Failed to update route stops" };
  }
}

/**
 * Deletes a route and all associated data.
 *
 * @param {string} routeId - The unique identifier of the route to delete.
 *
 * @returns {Promise<{ success: boolean; error?: string }>} A promise that resolves to:
 *   - success: Boolean indicating if the operation succeeded
 *   - error: Error message (only present if success is false)
 *
 * @remarks
 * This operation will cascade delete all associated data depending on the database constraints:
 * - Route stops
 * - Route schedules
 * - Any other related entities with foreign key constraints
 *
 * @example
 * ```typescript
 * const result = await deleteRoute('route-123');
 *
 * if (result.success) {
 *   console.log('Route deleted successfully');
 * } else {
 *   console.error('Failed to delete route:', result.error);
 * }
 * ```
 */
export async function deleteRoute(
  routeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.route.delete({
      where: { id: routeId },
    });

    // Revalidate the routes list
    revalidatePath("/routes");

    return { success: true };
  } catch (error) {
    console.error(`Failed to delete route ID ${routeId}:`, error);
    return { success: false, error: "Failed to delete route" };
  }
}
