// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold flex items-center mb-6">
            <span className="mr-2">🚌</span> OptiBus
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-6">
            <Link
              href="/privacy"
              className="hover:text-orange-500 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-orange-500 transition-colors"
            >
              Terms of Service
            </Link>
          </div>

          <div className="text-center">
            <p>
              &copy; {new Date().getFullYear()} OptiBus. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
