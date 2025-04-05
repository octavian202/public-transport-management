"use server";

import prisma from "@/lib/db";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username can't exceed 20 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
  role: z.enum(["user", "admin"], {
    errorMap: () => ({ message: "Role must be either 'user' or 'admin'" }),
  }),
});

export async function signupAction(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;
  const role = formData.get("role") as string;

  const rawData = { email, password, username, role };

  const result = signUpSchema.safeParse(rawData);

  console.log(rawData);

  if (!result.success) {
    console.log(result.error);
    redirect("/error");
  }

  const parsedData = result.data;
  const signupData = { email: parsedData.email, password: parsedData.password };

  // verify if user already exists
  const user = await prisma.user.findUnique({
    where: {
      email: parsedData.email,
    },
  });

  if (user) {
    redirect("/login");
  }

  const { data, error } = await supabase.auth.signUp(signupData);

  if (error || !data.user) {
    console.log(error);
    redirect("/error");
  }

  await prisma.user.create({
    data: {
      id: data.user.id,
      email: parsedData.email,
      username: parsedData.username,
      role: parsedData.role,
    },
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export async function loginAction(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ email, password });

  if (!result.success) {
    console.log(result.error);
    redirect("/error");
  }

  const parsedData = result.data;
  const loginData = { email: parsedData.email, password: parsedData.password };
  const { error } = await supabase.auth.signInWithPassword(loginData);

  if (error) {
    console.log(error);
    redirect("/error");
  }

  console.log("login success");

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
