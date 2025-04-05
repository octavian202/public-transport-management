// components/HowItWorksSection.tsx

interface StepProps {
  number: number;
  title: string;
  description: string;
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start mb-16 last:mb-0">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-800 text-white flex items-center justify-center text-xl font-bold mb-4 md:mb-0 md:mr-8">
        {number}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-blue-800 mb-2 text-center md:text-left">
          {title}
        </h3>
        <p className="text-center md:text-left">{description}</p>
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: "Data Collection",
      description:
        "Our system integrates with your existing bus occupancy tracking methods, whether they are automated passenger counters, manual counts, or ticket sales data.",
    },
    {
      number: 2,
      title: "Pattern Analysis",
      description:
        "Advanced algorithms analyze ridership patterns, identifying trends based on time of day, day of week, season, and special events.",
    },
    {
      number: 3,
      title: "Recommendation Generation",
      description:
        "The system generates specific recommendations for schedule adjustments, such as adding buses during Friday nights on high-demand routes or reducing service during consistently low-occupancy periods.",
    },
    {
      number: 4,
      title: "Implementation & Feedback",
      description:
        "Administrators implement the suggested changes and the system monitors the results, continuously learning and improving its recommendations based on outcomes.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-100">
      <div className="container mx-auto px-4">
        <h2 className="section-title">How It Works</h2>
        <div className="max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <Step
              key={index}
              number={step.number}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
