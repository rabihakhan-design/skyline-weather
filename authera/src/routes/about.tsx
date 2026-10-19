import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Skyline Weather" },
      { name: "description", content: "How Skyline Weather works and where its live data comes from." },
      { property: "og:title", content: "About Skyline Weather" },
      { property: "og:description", content: "Live, free weather data for every city in the world." },
    ],
  }),
  component: About,
});

const features = [
  ["🌡️", "Live conditions", "Temperature, feels-like, humidity, wind and pressure updated every few minutes."],
  ["📅", "7-day forecast", "Highs, lows, rain chance, UV index, sunrise and sunset for the week ahead."],
  ["🍃", "Air quality", "US AQI plus PM2.5, PM10, ozone and other pollutants."],
  ["🌍", "Any city", "Search millions of places worldwide in any spelling."],
];

function About() {
  return (
    <div className="space-y-10">
      <div className="max-w-2xl">
        <h1 className="font-display text-5xl font-bold">
          Weather, <span className="text-sun">beautifully clear.</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Skyline Weather brings real-time forecasts and air quality from the Open-Meteo API into one calm, fast interface.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {features.map(([i, t, d]) => (
          <div key={t} className="glass animate-rise rounded-3xl p-6">
            <p className="text-4xl">{i}</p>
            <h2 className="mt-3 font-display text-xl font-semibold">{t}</h2>
            <p className="mt-1 text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Data source: open-meteo.com (CC BY 4.0).</p>
    </div>
  );
}
