// components/FeaturesSection.tsx
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="feature-card flex-1 basis-64 max-w-sm md:shadow sm:rounded-lg p-5 text-center md:text-left">
      <div className="text-5xl text-blue-500 mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-blue-800 mb-4">{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default function FeaturesSection() {
  const features = [
    {
      icon: "📊",
      title: "Demand Analysis",
      description:
        "Analyze historical and real-time occupancy data to identify peak times and routes that need adjustment.",
    },
    {
      icon: "🔄",
      title: "Smart Recommendations",
      description:
        "Receive AI-powered suggestions to add or reduce buses based on actual ridership patterns and demand forecasts.",
    },
    {
      icon: "💰",
      title: "Cost Optimization",
      description:
        "Reduce operational costs by eliminating underutilized routes while maintaining service quality.",
    },
    {
      icon: "📱",
      title: "User-Friendly Dashboard",
      description:
        "Access intuitive visualizations and actionable insights through our comprehensive administrator dashboard.",
    },
    {
      icon: "📈",
      title: "Performance Metrics",
      description:
        "Track key performance indicators to measure the impact of schedule adjustments on efficiency and passenger satisfaction.",
    },
    {
      icon: "🔔",
      title: "Alerts & Notifications",
      description:
        "Receive timely alerts when routes consistently show high or low occupancy requiring attention.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h1 className="section-title text-5xl font-bold text-blue-800 mb-16 text-center">
          Key Features
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
