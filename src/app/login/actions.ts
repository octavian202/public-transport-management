"use server";

import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().nonempty({ message: "Password is required" }),
});

export async function loginAction(
  prevState: { message: string | null; errors?: string[] },
  formData: FormData
): Promise<{ message: string | null; errors?: string[] }> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ email, password });

  if (!result.success) {
    return {
      message: "Invalid email or password",
      errors: result.error.errors.map((error) => error.message),
    };
  }

  const parsedData = result.data;
  const loginData = { email: parsedData.email, password: parsedData.password };
  const { error } = await supabase.auth.signInWithPassword(loginData);

  if (error) {
    return {
      message: "Invalid email or password",
      errors: [error.message],
    };
  }

  return { message: "Logged in successfully", errors: [] };
}
