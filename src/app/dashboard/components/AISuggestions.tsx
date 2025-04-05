"use client";

import React, { useState, useEffect } from "react";
import { prisma } from "@/lib/prisma";

// Define the type for the props
interface AISuggestionsProps {
  routeId: string;
  onAccept: (suggestionId: string) => void;
}

// Define the type for a prediction
interface Prediction {
  id: string;
  date: Date;
}

export function AISuggestions({ routeId, onAccept }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<
    { id: string; suggestion: string; reasoning: string }[]
  >([]);

  useEffect(() => {
    async function fetchSuggestions() {
      const preds: Prediction[] = await prisma.prediction.findMany({
        where: { routeId },
      });
      // Mock reasoning (in reality, derived from predictedOccupancy JSON)
      setSuggestions(
        preds.map((p) => ({
          id: p.id,
          suggestion: "Add a new stop due to high predicted occupancy",
          reasoning: `Predicted occupancy exceeds 80% on ${p.date.toLocaleDateString()}`,
        }))
      );
    }
    fetchSuggestions();
  }, [routeId]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">AI Suggestions</h2>
      {suggestions.length === 0 ? (
        <p className="mt-4 text-sm text-gray-600">No suggestions available</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {suggestions.map((s) => (
            <li key={s.id} className="border p-4 rounded-md">
              <p className="font-medium">{s.suggestion}</p>
              <p className="text-sm text-gray-600">{s.reasoning}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => onAccept(s.id)}
                  className="px-3 py-1 bg-blue-800 text-white rounded-md"
                >
                  Accept
                </button>
                <button className="px-3 py-1 bg-gray-300 text-gray-800 rounded-md">
                  Deny
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
