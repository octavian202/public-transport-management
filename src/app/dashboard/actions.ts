"use server";

import { prisma } from "@/lib/prisma";

export async function fetchRoutes() {
  return await prisma.route.findMany({
    select: { id: true, name: true, description: true },
  });
}

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
