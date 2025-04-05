import Image from "next/image";
import { loginAction, signupAction, logoutAction } from "@/actions/auth";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import Footer from "@/components/Footer";

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  console.log(data?.user);

  if (!error && data.user) {
    return (
      <div>
        {data.user.email}

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
