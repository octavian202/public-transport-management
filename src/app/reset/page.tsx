"use client";

import { resetPassword } from "@/actions/auth";
import Link from "next/link";
import React, { useEffect } from "react";
import { z } from "zod";

const emailSchema = z.string().email({ message: "Invalid email address" });

export default function LoginPage() {
  const [email, setEmail] = React.useState("");

  const [emailErrors, setEmailErrors] = React.useState<string[]>([]);

  useEffect(() => {
    const validatedEmail = emailSchema.safeParse(email);

    if (!validatedEmail.success) {
      setEmailErrors(validatedEmail.error.errors.map((error) => error.message));
    } else {
      setEmailErrors([]);
    }
  }, [email]);

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
          <form className="space-y-6" action={resetPassword}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Your email address"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={emailErrors.length > 0}
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
