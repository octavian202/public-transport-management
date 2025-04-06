import React from "react";
import StopSelection from "./StopSelection";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function StopSelectionPage() {
  const stops = await prisma.stop.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  if (stops.length === 0) {
    redirect("/404");
  }

  return (
    <div className="bg-slate-100">
      <StopSelection stops={stops} />
    </div>
  );
}
