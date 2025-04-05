"use client";

import Link from "next/link";
import React, { useActionState, useEffect } from "react";
import { z } from "zod";
import { loginAction } from "./actions";
import { toast } from "sonner";

const emailSchema = z.string().email({ message: "Invalid email address" });
const passwordSchema = z.string().nonempty({ message: "Password is required" });

export default function LoginPage() {
  const [serverState, formAction] = useActionState(loginAction, {
    message: "",
    errors: [],
  });

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [allGood, setAllGood] = React.useState(false);

  const [emailErrors, setEmailErrors] = React.useState<string[]>([]);
  const [passwordErrors, setPasswordErrors] = React.useState<string[]>([]);

  useEffect(() => {
    const validatedEmail = emailSchema.safeParse(email);

    if (!validatedEmail.success) {
      setEmailErrors(validatedEmail.error.errors.map((error) => error.message));
    } else {
      setEmailErrors([]);
    }
  }, [email]);

  useEffect(() => {
    const validatedPassword = passwordSchema.safeParse(password);

    if (!validatedPassword.success) {
      setPasswordErrors(
        validatedPassword.error.errors.map((error) => error.message)
      );
    } else {
      setPasswordErrors([]);
    }
  }, [password]);

  useEffect(() => {
    if (emailErrors.length === 0 && passwordErrors.length === 0) {
      setAllGood(true);
    } else {
      setAllGood(false);
    }
  }, [emailErrors, passwordErrors]);

  useEffect(() => {
    if (serverState.message) {
      if (serverState.errors && serverState.errors.length > 0) {
        serverState.errors.forEach((error) => {
          toast.error(error);
        });
      } else if (
        serverState &&
        serverState.message &&
        serverState.errors?.length === 0
      ) {
        toast.success(serverState.message);
      }
    }
  }, [serverState]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="text-3xl font-bold text-blue-800 flex items-center">
            <span className="mr-2">🚌</span> OptiBus
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            href="/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" action={formAction}>
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
            {emailErrors.length > 0 && email.length > 0 && (
              <div className="text-red-500 text-sm">
                {emailErrors.map((error, index) => (
                  <p key={index}>X {error}</p>
                ))}
              </div>
            )}

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
                  autoComplete="current-password"
                  required
                  placeholder="Your password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </div>
            </div>
            {passwordErrors.length > 0 && password.length > 0 && (
              <div className="text-red-500 text-sm">
                {passwordErrors.map((error, index) => (
                  <p key={index}>X {error}</p>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  href="/reset"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={!allGood}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 hover:shadow-lg hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign in
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
