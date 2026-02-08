const stats = [
  { value: "500K+", label: "Happy Drivers" },
  { value: "15K+", label: "Parking Locations" },
  { value: "50+", label: "Cities Covered" },
  { value: "4.9", label: "App Store Rating" },
];

export function Stats() {
  return (
    <section className="py-16 bg-secondary">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-foreground sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
