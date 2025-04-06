"use server";

import { prisma } from "@/lib/prisma";

export async function fetchRoutes() {
  return await prisma.route.findMany({
    select: { id: true, name: true, description: true },
  });
}

export type RouteDetails = {
  id: string;
};
export async function fetchRouteDetails(routeId: string) {
  return await prisma.route.findUnique({
    where: { id: routeId },
    include: {
      routeStops: {
        orderBy: { stopOrder: "asc" },
        include: { stop: true },
      },
      trips: true,
    },
  });
}

export async function acceptSuggestion(suggestionId: string) {
  // Placeholder: Logic to update route based on suggestion
  // Example: Adding a stop to a route
  const prediction = await prisma.prediction.findUnique({
    where: { id: suggestionId },
  });
  if (!prediction) throw new Error("Suggestion not found");

  // Example: Update route logic (simplified)
  // In a real scenario, parse predictedOccupancy JSON and update RouteStop/TimetableEntry
  await prisma.route.update({
    where: { id: prediction.routeId },
    data: { description: "Updated based on AI suggestion" },
  });
}

export async function fetchTrips(
  page: number = 1,
  limit: number = 10,
  status?: string
) {
  const where = status ? { status } : {};

  // Ensure page and limit are positive integers
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.max(1, Math.floor(limit));

  const trips = await prisma.trip.findMany({
    where,
    include: {
      route: { select: { name: true } },
      timetableEntry: { select: { departureTime: true } },
      occupancyData: {
        orderBy: { timestamp: "desc" },
        take: 1, // Get latest occupancy data
      },
    },
    orderBy: { departureTime: "asc" },
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  });

  const total = await prisma.trip.count({ where });

  return { trips, total };
}

export async function fetchTripDetails(tripId: string) {
  return await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      route: true,
      timetableEntry: true,
      occupancyData: { orderBy: { timestamp: "desc" }, take: 1 },
    },
  });
}

export async function createTrip(data: {
  routeId: string;
  timetableEntryId?: string;
  vehicleType: string;
  capacity: number;
  features?: string;
  date: Date;
  departureTime: Date;
  arrivalTime: Date;
  status: string;
}) {
  return await prisma.trip.create({ data });
}

export async function updateTrip(
  tripId: string,
  data: {
    vehicleType?: string;
    capacity?: number;
    features?: string;
    date?: Date;
    departureTime?: Date;
    arrivalTime?: Date;
    status?: string;
  }
) {
  return await prisma.trip.update({
    where: { id: tripId },
    data,
  });
}

export async function deleteTrip(tripId: string) {
  return await prisma.trip.delete({
    where: { id: tripId },
  });
}
