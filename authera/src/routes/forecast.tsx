import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { citySearch, describe, forecastQuery, DEFAULT_CITY } from "@/lib/weather";
import { Temp } from "@/lib/prefs";
import { CityMap } from "@/components/CityMap";
import { CitySearch, PageError } from "@/components/CitySearch";

export const Route = createFileRoute("/forecast")({
  validateSearch: citySearch,
  loaderDeps: ({ search }) => ({ city: search.city ?? DEFAULT_CITY }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(forecastQuery(deps.city)),
  head: () => ({
    meta: [
      { title: "7-Day Forecast — Skyline Weather" },
      { name: "description", content: "Seven-day weather forecast with highs, lows, rain chance, UV and sunrise times." },
      { property: "og:title", content: "7-Day Forecast — Skyline Weather" },
      { property: "og:description", content: "Plan your week with a detailed seven-day forecast." },
    ],
  }),
  errorComponent: PageError,
  component: ForecastPage,
});

function ForecastPage() {
  const city = Route.useSearch().city ?? DEFAULT_CITY;
  const { data } = useSuspenseQuery(forecastQuery(city));
  const d = data.forecast.daily;
  const lo = Math.min(...d.temperature_2m_min);
  const hi = Math.max(...d.temperature_2m_max);

  return (
    <div className="space-y-8">
      <CitySearch city={city} to="/forecast" />
      <h1 className="font-display text-4xl font-bold">
        7-day forecast · <span className="text-sun">{data.place.name}</span>
      </h1>
      <div className="space-y-3">
        {d.time.map((day, i) => {
          const [label, icon] = describe(d.weather_code[i]!);
          const left = ((d.temperature_2m_min[i]! - lo) / (hi - lo || 1)) * 100;
          const width = ((d.temperature_2m_max[i]! - d.temperature_2m_min[i]!) / (hi - lo || 1)) * 100;
          return (
            <div key={day} className="glass animate-rise grid items-center gap-4 rounded-2xl p-5 md:grid-cols-[140px_60px_1fr_1fr]">
              <div>
                <p className="font-display font-semibold">
                  {i === 0 ? "Today" : new Date(day).toLocaleDateString("en", { weekday: "long" })}
                </p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
              <span className="text-4xl">{icon}</span>
              <div className="flex items-center gap-3">
                <span className="w-10 text-right text-muted-foreground"><Temp c={d.temperature_2m_min[i]!} /></span>
                <div className="relative h-2 flex-1 rounded-full bg-secondary">
                  <div className="temp-bar absolute h-2 rounded-full" style={{ left: `${left}%`, width: `${Math.max(width, 4)}%` }} />
                </div>
                <span className="w-10 font-semibold"><Temp c={d.temperature_2m_max[i]!} /></span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="text-rain">💧 {d.precipitation_probability_max[i]! ?? 0}%</span>
                <span>UV {Math.round(d.uv_index_max[i]!)}</span>
                <span>🌅 {d.sunrise[i]!.slice(11)}</span>
                <span>🌇 {d.sunset[i]!.slice(11)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <CityMap lat={data.place.latitude} lon={data.place.longitude} name={data.place.name} />
    </div>
  );
}
