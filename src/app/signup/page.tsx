"use client";

import { signupAction } from "@/actions/auth";
import React, { useEffect } from "react";
import Link from "next/link";
import { z } from "zod";

const emailValidator = z.string().email({ message: "Invalid email address" });

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

const usernameValidator = z
  .string()
  .min(3, { message: "Username must be at least 3 characters" })
  .max(20, { message: "Username must be less than 20 characters" })
  .regex(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only contain letters, numbers, and underscores",
  });

export default function () {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [allGood, setAllGood] = React.useState(false);

  const [emailErrors, setEmailErrors] = React.useState<string[]>([]);
  const [passwordErrors, setPasswordErrors] = React.useState<string[]>([]);
  const [usernameErrors, setUsernameErrors] = React.useState<string[]>([]);
  const [confirmPasswordErrors, setConfirmPasswordErrors] = React.useState<
    string[]
  >([]);

  useEffect(() => {
    const validatedEmail = emailValidator.safeParse(email);

    if (!validatedEmail.success) {
      setEmailErrors(validatedEmail.error.errors.map((error) => error.message));
    } else {
      setEmailErrors([]);
    }
  }, [email]);

  useEffect(() => {
    const validatedPassword = passwordValidator.safeParse(password);
    if (!validatedPassword.success) {
      setPasswordErrors(
        validatedPassword.error.errors.map((error) => error.message)
      );
    } else {
      setPasswordErrors([]);
    }
  }, [password]);

  useEffect(() => {
    const validatedUsername = usernameValidator.safeParse(username);
    if (!validatedUsername.success) {
      setUsernameErrors(
        validatedUsername.error.errors.map((error) => error.message)
      );
    } else {
      setUsernameErrors([]);
    }
  }, [username]);

  useEffect(() => {
    if (password !== confirmPassword) {
      setConfirmPasswordErrors(["Passwords do not match"]);
    } else {
      setConfirmPasswordErrors([]);
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    if (
      emailErrors.length === 0 &&
      passwordErrors.length === 0 &&
      usernameErrors.length === 0 &&
      confirmPasswordErrors.length === 0
    ) {
      setAllGood(true);
    } else {
      setAllGood(false);
    }
  }, [emailErrors, passwordErrors, usernameErrors]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="text-3xl font-bold text-blue-800 flex items-center">
            <span className="mr-2">🚌</span> OptiBus
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            log in
          </Link>
        </p>
      </div>
      <div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Username"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                  />
                </div>
              </div>
              {usernameErrors.length > 0 && (
                <div className="text-red-500 text-sm mt-1">
                  {usernameErrors.map((error, index) => (
                    <p key={index}>X {error}</p>
                  ))}
                </div>
              )}
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
                    autoCapitalize="off"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    placeholder="Your email address"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              {emailErrors.length > 0 && (
                <div className="text-red-500 text-sm mt-1">
                  {emailErrors.map((error, index) => (
                    <p key={index}>X {error}</p>
                  ))}
                </div>
              )}

              <div className="flex justify-between gap-4">
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
                  <label
                    htmlFor="c_password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="c_password"
                      name="c_password"
                      type="password"
                      placeholder="Confirm Password"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      value={confirmPassword}
                    />
                  </div>
                </div>
              </div>
              {passwordErrors.length > 0 && (
                <div className="text-red-500 text-sm mt-1">
                  {passwordErrors.map((error, index) => (
                    <p key={index}>X {error}</p>
                  ))}
                </div>
              )}
              {confirmPasswordErrors.length > 0 && (
                <div className="text-red-500 text-sm mt-1">
                  {confirmPasswordErrors.map((error, index) => (
                    <p key={index}>X {error}</p>
                  ))}
                </div>
              )}
              <div>
                <label
                  htmlFor="roles"
                  className="block text-sm font-medium text-gray-700"
                >
                  Choose your role:
                </label>

                <select
                  id="roles"
                  name="roles"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  defaultValue={"user"}
                >
                  {/* <option selected disabled>
                    Role
                  </option> */}
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div>
                <button
                  formAction={signupAction}
                  disabled={!allGood}
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 hover:cursor-pointer hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sign up
                </button>
              </div>
            </form>
          </div>
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
