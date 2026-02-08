import { Clock, CreditCard, MapPin, Shield, Smartphone, Zap } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Real-time Availability",
    description:
      "See which spots are free instantly with live updates from sensors.",
  },
  {
    icon: Smartphone,
    title: "Easy Mobile Booking",
    description:
      "Reserve your spot in seconds from your phone, anywhere, anytime.",
  },
  {
    icon: CreditCard,
    title: "Seamless Payments",
    description:
      "Pay securely with Apple Pay, Google Pay, or any credit card.",
  },
  {
    icon: Clock,
    title: "Flexible Duration",
    description:
      "Book for an hour or a full day. Extend your time right from the app.",
  },
  {
    icon: Shield,
    title: "Secure & Insured",
    description:
      "All parking locations are monitored 24/7 with full insurance coverage.",
  },
  {
    icon: Zap,
    title: "EV Charging",
    description:
      "Find spots with charging stations and power up while you park.",
  },
];

export function Features() {
  return (
    <section className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Parking made simple
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Everything you need for stress-free parking, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-border bg-card p-6 hover:border-primary/20 hover:shadow-md transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
