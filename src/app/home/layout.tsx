import { getUser } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import React from "react";
import UserHeader from "./UserHeader";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <UserHeader />

      {children}
    </div>
  );
}
