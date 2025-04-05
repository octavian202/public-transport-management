// components/Header.tsx
"use client";
import { useState } from "react";
import Link from "next/link";

export default function AdminHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-blue-800 text-white py-4 px-8 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold flex items-center">
          <span className="mr-2">🚌</span> OptiBus
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white focus:outline-none cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8 items-center">
            <li>
              <Link href="/dashboard" className="cta-button py-2 px-4">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/analytics" className="cta-button py-2 px-4">
                Analytics
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4">
          <ul className="flex flex-col space-y-4">
            <li>
              <Link
                href="/dashboard"
                className="cta-button py-2 px-4 inline-block w-full text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/analytics"
                className="cta-button py-2 px-4 inline-block w-full text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Analytics
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
