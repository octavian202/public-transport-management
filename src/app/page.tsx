import Image from "next/image";
import { logoutAction } from "@/actions/auth";
import { getUser } from "@/utils/supabase/server";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import Footer from "@/components/Footer";

export default async function Home() {
  const user = await getUser();

  console.log(user);

  if (user) {
    return (
      <div>
        {user.email}

        <form>
          <button formAction={logoutAction}>sign out</button>
        </form>
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
