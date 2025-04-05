import { z } from "zod";

// ===== Stop =====
export const StopSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  accessibility: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Stop = z.infer<typeof StopSchema>;

// ===== Vehicle =====
export const VehicleSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  capacity: z.number().int(),
  features: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Vehicle = z.infer<typeof VehicleSchema>;

// ===== Route =====
export const RouteSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  operatingHours: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Route = z.infer<typeof RouteSchema>;

// ===== RouteStop =====
export const RouteStopSchema = z.object({
  id: z.string().uuid(),
  routeId: z.string().uuid(),
  stopId: z.string().uuid(),
  stopOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type RouteStop = z.infer<typeof RouteStopSchema>;

// ===== Trip =====
export const TripSchema = z.object({
  id: z.string().uuid(),
  routeId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  date: z.coerce.date(),
  departureTime: z.coerce.date(),
  arrivalTime: z.coerce.date(),
  status: z.enum(["Scheduled", "Active", "Completed", "Cancelled"]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Trip = z.infer<typeof TripSchema>;

// ===== OccupancyData =====
export const OccupancyDataSchema = z.object({
  id: z.string().uuid(),
  tripId: z.string().uuid(),
  timestamp: z.coerce.date(),
  count: z.number().int(),
  percentage: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type OccupancyData = z.infer<typeof OccupancyDataSchema>;

// ===== Prediction =====
export const PredictionSchema = z.object({
  id: z.string().uuid(),
  routeId: z.string().uuid(),
  date: z.coerce.date(),
  predictedOccupancy: z.any(), // Consider using a stricter schema if JSON structure is known
  confidence: z.number().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Prediction = z.infer<typeof PredictionSchema>;

// ===== User =====
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().nullable().optional(),
  role: z.string().default("USER"),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  preferences: z.any().optional(), // Again, define a schema if JSON structure is known
  lastLogin: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;
