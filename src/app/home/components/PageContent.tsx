"use client"

import React from "react";

type Props = {
  tripsData: {
    id: string;
    routeId: string;
    routeName: string;
    vehicleType: string;
    waitTime: number;
    occupancy: number;
    occupancyPrediction?: number;
    standingSeats: number;
    seatedSeats: number;
  }[];
};

// ruta, timpul in care ajunge, timp / delay, occupancy, locuri de stat jos, locuri de stat in picioare
// + prezicere la occupancy data cand ajunge la tine

export default function PageContent({ tripsData }: Props) {

  const [search, setSearch] = React.useState<string>("");

  return <div>page content</div>;
}
