// components/HeroSection.tsx
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-white text-center px-4 py-20">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-blue-900/80 z-10"></div>
        <Image
          src="/images/bus-hero.jpg"
          alt="Bus transit system"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Smart Bus Schedule Optimization
        </h1>
        <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
          Maximize efficiency, reduce costs, and improve passenger experience
          with data-driven bus scheduling that adapts to real-world demand
          patterns.
        </p>
      </div>
    </section>
  );
}
