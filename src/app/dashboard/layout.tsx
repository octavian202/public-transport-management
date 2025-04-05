import prisma from "@/lib/db";
import { getUser } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  const userData = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!userData || userData.role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}
