"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function logoutAction() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

const emailSchema = z.string().email({ message: "Invalid email address" });
export async function resetPassword(formData: FormData) {
  const supabase = await createClient();

  const rawEmail = formData.get("email") as string;
  const result = emailSchema.safeParse(rawEmail);
  if (!result.success) {
    console.log(result.error);
    redirect("/error");
  }
  const email = result.data;

  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    console.log(error);
    redirect("/error");
  }

  console.log("reset password success");

  revalidatePath("/", "layout");
  redirect("/login");
}

const passwordValidator = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(20, { message: "Password must be at most 20 characters" })
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
  })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[\W_]/, {
    message: "Password must contain at least one special character",
  });
export async function setNewPassword(formData: FormData) {
  const supabase = await createClient();

  const rawPassword = formData.get("password") as string;
  const result = passwordValidator.safeParse(rawPassword);
  if (!result.success) {
    console.log(result.error);
    redirect("/error");
  }
  const newPassword = result.data;

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.log(error);
    redirect("/error");
  }
  console.log("password updated");
  revalidatePath("/", "layout");
  redirect("/");
}
