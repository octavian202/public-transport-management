import { logoutAction } from "@/actions/auth";
import { getUser } from "@/utils/supabase/server";
import Header from "@/components/Header";
import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import Footer from "@/components/Footer";
import prisma from "@/lib/db";

export default async function Home() {
  const user = await getUser();

  console.log(user);

  if (user) {
    const userData = await prisma.user.findFirst({
      where: {
        id: user?.id,
      },
    });

    const userRole = userData?.role;
    const isAdmin = userRole === "admin";

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="text-3xl font-bold text-blue-800 flex items-center">
              <span className="mr-2">🚌</span> OptiBus
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            You are already logged in.
          </h2>
        </div>

        <div className="mt-8 mx-auto max-w-[90%] md:max-w-[60%] lg:max-w-lg">
          {" "}
          <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
            {/*{user.email}*/}
            {isAdmin && (
              <Link
                href="/dashboard"
                className="text-lg mb-4 w-full flex justify-center py-2 px-4 rounded-md shadow-sm font-medium text-white bg-blue-800 hover:bg-blue-700 border-transparent border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 hover:shadow-lg hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                View Dashboard
              </Link>
            )}
            <form>
              <button
                formAction={logoutAction}
                className="text-lg w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-blue-800 bg-transparent hover:border-blue-700 hover:border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 hover:shadow-lg hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
  return (
    <main>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <Footer />
    </main>
  );
}
