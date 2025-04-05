"use server";

import { prisma } from "../lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- Shared Route Type ---
export type RouteBase = {
  id: string;
  name: string;
  description: string | null;
  operatingHours: string | null;
};

// --- Full Route Details with Stops & Trips ---
export type RouteDetails = RouteBase & {
  routeStops: {
    stopOrder: number;
    stop: {
      id: string;
      name: string;
      location: string;
    };
  }[];
  trips: {
    id: string;
    departureTime: Date;
    vehicle: {
      id: string;
      licensePlate: string;
    };
  }[];
};

// --- Zod Schema for FormData ---
const routeSchema = z.object({
  name: z.string().min(1, "Route name is required"),
  description: z.string().nullable().optional(),
  operatingHours: z.string().nullable().optional(),
});

function parseFormData(formData: FormData): z.infer<typeof routeSchema> | null {
  const data = {
    name: formData.get("name"),
    description: formData.get("description"),
    operatingHours: formData.get("operatingHours"),
  };

  const parsed = routeSchema.safeParse({
    name: data.name ?? "",
    description: data.description === "" ? null : data.description,
    operatingHours: data.operatingHours === "" ? null : data.operatingHours,
  });

  if (!parsed.success) return null;
  return parsed.data;
}

// --- 1. Get All Routes ---
export async function getAllRoutes(): Promise<RouteBase[]> {
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

// --- 2. Get Route Details ---
export async function getRouteDetails(
  routeId: string
): Promise<RouteDetails | null> {
  try {
    const route = await prisma.route.findUnique({
      where: { id: routeId },
      include: {
        routeStops: {
          include: { stop: true },
          orderBy: { stopOrder: "asc" },
        },
        trips: {
          where: { date: { gte: new Date() } },
          include: { vehicle: true },
          orderBy: { departureTime: "asc" },
          take: 10,
        },
      },
    });

    return route as RouteDetails | null;
  } catch (error) {
    console.error(`Failed to fetch route details for ID ${routeId}:`, error);
    throw new Error("Failed to fetch route details");
  }
}

// --- 3. Create Route ---
export async function createRoute(
  formData: FormData
): Promise<{ success: boolean; route?: RouteBase; error?: string }> {
  try {
    const parsed = parseFormData(formData);
    if (!parsed) {
      return { success: false, error: "Invalid form data" };
    }

    const newRoute = await prisma.route.create({
      data: parsed,
    });

    revalidatePath("/routes");

    return { success: true, route: newRoute };
  } catch (error) {
    console.error("Failed to create route:", error);
    return { success: false, error: "Failed to create route" };
  }
}

// --- 4. Update Route ---
export async function updateRoute(
  routeId: string,
  formData: FormData
): Promise<{ success: boolean; route?: RouteBase; error?: string }> {
  try {
    const parsed = parseFormData(formData);
    if (!parsed) {
      return { success: false, error: "Invalid form data" };
    }

    const updatedRoute = await prisma.route.update({
      where: { id: routeId },
      data: parsed,
    });

    revalidatePath(`/routes/${routeId}`);

    return { success: true, route: updatedRoute };
  } catch (error) {
    console.error(`Failed to update route ID ${routeId}:`, error);
    return { success: false, error: "Failed to update route" };
  }
}

// --- 5. Update Route Stops ---
export async function updateRouteStops(
  routeId: string,
  stopsData: { stopId: string }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.routeStop.deleteMany({ where: { routeId } });

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

    revalidatePath(`/routes/${routeId}`);

    return { success: true };
  } catch (error) {
    console.error(`Failed to update stops for route ID ${routeId}:`, error);
    return { success: false, error: "Failed to update route stops" };
  }
}

// --- 6. Delete Route ---
export async function deleteRoute(
  routeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.route.delete({
      where: { id: routeId },
    });

    revalidatePath("/routes");

    return { success: true };
  } catch (error) {
    console.error(`Failed to delete route ID ${routeId}:`, error);
    return { success: false, error: "Failed to delete route" };
  }
}
