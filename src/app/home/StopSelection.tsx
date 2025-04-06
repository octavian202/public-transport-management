"use client";

import Link from "next/link";
import React, { useState } from "react";

export default function StopSelection({
  stops,
}: {
  stops: { id: string; name: string }[];
}) {
  const [search, setSearch] = useState<string>("");

  return (
    <div className="w-full text-center">
      <h1 className="section-title text-4xl font-bold text-blue-800 w-full text-center mb-6">
        Select a stop
      </h1>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search for a stop"
        className="border rounded p-2 mb-4 w-5xl"
      />
      <ul className="list-disc">
        {stops
          .filter((stop) =>
            stop.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((stop) => (
            <li key={stop.id} className="mb-2">
              <Link
                href={`/home/${stop.id}`}
                className="text-blue-800 bg-white hover:underline hover:bg-blue-800 hover:text-white"
              >
                {stop.name}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
