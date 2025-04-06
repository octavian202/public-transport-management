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
    <div
      className="w-full text-center pt-10"
      style={{ padding: 20, minHeight: 1000 }}
    >
      <h1 className="section-title text-4xl font-bold text-blue-800 w-full text-center mb-6">
        Select a stop
      </h1>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search for a stop"
        className="border rounded p-2 mb-4 w-full md:w-5xl bg-white border-blue-800"
      />
      <ul className="list-none w-sm md:w-5xl mx-auto">
        {stops
          .filter((stop) =>
            stop.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((stop) => (
            <Link
              href={`/home/${stop.id}`}
              className="text-blue-800 w-full bg-white  hover:bg-blue-800 hover:text-white"
            >
              <li
                key={stop.id}
                className="mb-2 w-full bg-white hover:bg-blue-800 shadow rounded p-2"
              >
                {stop.name}
              </li>
            </Link>
          ))}
      </ul>
    </div>
  );
}
