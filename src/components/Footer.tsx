// components/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import whiteLogo from "@/public/white_logo.png";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold flex items-center mb-6">
            <Image src={whiteLogo} alt="" width={200} height={50} />
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
