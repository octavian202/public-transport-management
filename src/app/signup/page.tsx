"use client";

import React, { useActionState, useEffect } from "react";
import Link from "next/link";
import { z } from "zod";
import { signupAction } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import blueLogo from "@/public/blue_logo.png";

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

export default function SignupPage() {
  const [serverState, formAction] = useActionState(signupAction, {
    message: "",
    errors: [],
  });

  const router = useRouter();

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
  // const [serverErrors, setServerErrors] = React.useState<string[]>([]);
  // const [serverMessage, setServerMessage] = React.useState<string | null>(null);

  useEffect(() => {
    const validatedEmail = emailValidator.safeParse(email);

    if (!validatedEmail.success && email.length > 0) {
      setEmailErrors(validatedEmail.error.errors.map((error) => error.message));
    } else {
      setEmailErrors([]);
    }
  }, [email]);

  useEffect(() => {
    const validatedPassword = passwordValidator.safeParse(password);
    if (!validatedPassword.success && password.length > 0) {
      setPasswordErrors(
        validatedPassword.error.errors.map((error) => error.message)
      );
    } else {
      setPasswordErrors([]);
    }
  }, [password]);

  useEffect(() => {
    const validatedUsername = usernameValidator.safeParse(username);

    if (!validatedUsername.success && username.length > 0) {
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
      confirmPasswordErrors.length === 0 &&
      email.length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      username.length > 0
    ) {
      setAllGood(true);
    } else {
      setAllGood(false);
    }
  }, [emailErrors, passwordErrors, usernameErrors, confirmPasswordErrors]);

  useEffect(() => {
    if (serverState.message) {
      if (serverState.errors && serverState.errors.length > 0) {
        serverState.errors.forEach((error) => {
          toast.error(error);
        });
      } else {
        toast.success(serverState.message);
        setTimeout(() => {
          router.push("/login");
        }, 500);
      }
    }
  }, [serverState]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="text-3xl font-bold text-blue-800 flex items-center">
            <Image src={blueLogo} alt="" width={200} height={50} />
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
        <div className="mt-8 mx-auto max-w-[90%] md:max-w-[70%] lg:max-w-lg">
          <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
            <form className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 pl-1"
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
                  className="block text-sm font-medium text-gray-700 pl-1"
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

              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="w-full">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 pl-1"
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

                <div className="w-full">
                  <label
                    htmlFor="c_password"
                    className="block text-sm font-medium text-gray-700 pl-1"
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
                  className="block text-sm font-medium text-gray-700 mb-1 pl-1"
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

              <div className="pt-2">
                <button
                  formAction={formAction}
                  disabled={!allGood}
                  type="submit"
                  className="text-lg w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 hover:cursor-pointer hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
