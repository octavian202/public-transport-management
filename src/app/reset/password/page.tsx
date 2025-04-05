"use client";

import { setNewPassword } from "@/actions/auth";
import Link from "next/link";
import React, { useEffect } from "react";
import { z } from "zod";

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

export default function LoginPage() {
  const [password, setPassword] = React.useState("");

  const [passwordErrors, setPasswordErrors] = React.useState<string[]>([]);

  useEffect(() => {
    const validatedEmail = passwordValidator.safeParse(password);

    if (!validatedEmail.success) {
      setPasswordErrors(
        validatedEmail.error.errors.map((error) => error.message)
      );
    } else {
      setPasswordErrors([]);
    }

    console.log(passwordErrors);
  }, [password]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="text-3xl font-bold text-blue-800 flex items-center">
            <span className="mr-2">🚌</span> OptiBus
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            login
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" action={setNewPassword}>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm "
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={passwordErrors.length > 0}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 hover:shadow-lg hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset password
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
