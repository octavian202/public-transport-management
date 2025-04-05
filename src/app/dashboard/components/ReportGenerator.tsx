"use client";

import React, { useState } from "react";
import { prisma } from "@/lib/prisma";
import jsPDF from "jspdf";

// Define the type for a route
interface Route {
  id: string;
  name: string;
}

// Define the type for occupancy data
interface OccupancyData {
  timestamp: Date; // Prisma returns Date objects for DateTime fields
  percentage: number;
}

// Define the props for the component
interface ReportGeneratorProps {
  routes: Route[];
}

export function ReportGenerator({ routes }: ReportGeneratorProps) {
  const [routeId, setRouteId] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  const generateReport = async () => {
    const occupancy: OccupancyData[] = await prisma.occupancyData.findMany({
      where: {
        trip: { routeId },
        timestamp: {
          gte: new Date(dateRange.start),
          lte: new Date(dateRange.end),
        },
      },
    });

    const doc = new jsPDF();
    doc.text(`Occupancy Report for Route ${routeId}`, 10, 10);
    occupancy.forEach((data: OccupancyData, i: number) => {
      doc.text(
        `${data.timestamp.toLocaleString()}: ${data.percentage}%`,
        10,
        20 + i * 10
      );
    });
    doc.save(`report-${routeId}.pdf`);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Report Generator</h2>
      <div className="mt-4 space-y-4">
        <select
          value={routeId}
          onChange={(e) => setRouteId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select a route</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) =>
            setDateRange({ ...dateRange, start: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={generateReport}
          className="w-full py-2 px-4 bg-blue-800 text-white rounded-md"
        >
          Generate Report
        </button>
      </div>
    </div>
  );
}
