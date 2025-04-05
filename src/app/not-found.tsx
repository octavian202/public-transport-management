"use client";

import { redirect } from "next/navigation";
import React from "react";

export default function NotFound() {
  const [counter, setCounter] = React.useState(3);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => prev - 1);
    }, 1000);

    if (counter <= 0) {
      redirect("/");
    }

    return () => clearInterval(interval);
  }, [counter]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="text-3xl font-bold text-blue-800 flex items-center">
            <span className="mr-2">🚌</span> OptiBus
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Something went wrong, redirecting in {counter}
        </h2>
      </div>
    </div>
  );
}
