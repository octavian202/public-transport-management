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

export async function signupAction(
  prevState: { message: string | null; errors?: string[] },
  formData: FormData
): Promise<{ message: string | null; errors?: string[] }> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("c_password") as string;
  const username = formData.get("username") as string;
  const role = formData.get("roles") as string;

  if (password !== confirmPassword) {
    return {
      message: "Passwords do not match",
      errors: ["Passwords do not match"],
    };
  }

  const rawData = { email, password, username, role };

  const result = signUpSchema.safeParse(rawData);

  if (!result.success) {
    return {
      message: "Invalid input",
      errors: result.error.errors.map((error) => error.message),
    };
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
    return {
      message: "User already exists",
      errors: ["User already exists"],
    };
  }

  const { data, error } = await supabase.auth.signUp(signupData);

  if (error || !data.user) {
    return {
      message: "Error signing up",
      errors: [error?.message || "Unknown error"],
    };
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
  redirect("/");
  return { message: "Please check the email for confirmation", errors: [] };
}
