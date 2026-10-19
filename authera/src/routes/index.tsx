import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { citySearch, describe, forecastQuery, DEFAULT_CITY } from "@/lib/weather";
import { Temp } from "@/lib/prefs";
import { CityMap } from "@/components/CityMap";
import { CitySearch, PageError, Stat } from "@/components/CitySearch";

export const Route = createFileRoute("/")({
  validateSearch: citySearch,
  loaderDeps: ({ search }) => ({ city: search.city ?? DEFAULT_CITY }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(forecastQuery(deps.city)),
  head: () => ({
    meta: [
      { title: "Skyline Weather — Live conditions for any city" },
      { name: "description", content: "Live temperature, wind, humidity and hourly outlook for any city in the world." },
      { property: "og:title", content: "Skyline Weather — Live conditions" },
      { property: "og:description", content: "Live temperature, wind, humidity and hourly outlook for any city." },
    ],
  }),
  errorComponent: PageError,
  component: Home,
});

function Home() {
  const city = Route.useSearch().city ?? DEFAULT_CITY;
  const { data } = useSuspenseQuery(forecastQuery(city));
  const { place, forecast } = data;
  const c = forecast.current;
  const [label, icon] = describe(c.weather_code);
  const nowIdx = Math.max(0, forecast.hourly.time.findIndex((t) => t >= c.time.slice(0, 13)));
  const hours = forecast.hourly.time.slice(nowIdx, nowIdx + 12).map((t, i) => ({
    t,
    temp: forecast.hourly.temperature_2m[nowIdx + i]!,
    code: forecast.hourly.weather_code[nowIdx + i]!,
    rain: forecast.hourly.precipitation_probability[nowIdx + i]!,
  }));

  return (
    <div className="space-y-10">
      <CitySearch city={city} to="/" />
      <section className="glass animate-rise grid gap-8 rounded-[2rem] p-8 md:grid-cols-2 md:p-12">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Now in</p>
          <h1 className="font-display text-4xl font-bold md:text-5xl">
            {place.name}, <span className="text-sun">{place.country}</span>
          </h1>
          <div className="mt-6 flex items-center gap-6">
            <span className="text-7xl md:text-8xl">{icon}</span>
            <div>
              <p className="font-display text-7xl font-bold leading-none md:text-8xl"><Temp c={c.temperature_2m} /></p>
              <p className="mt-2 text-lg text-muted-foreground">{label} · feels like <Temp c={c.apparent_temperature} /></p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Stat k="Humidity" v={`${c.relative_humidity_2m}%`} />
          <Stat k="Wind" v={`${Math.round(c.wind_speed_10m)} km/h`} />
          <Stat k="Pressure" v={`${Math.round(c.pressure_msl)} hPa`} />
          <Stat k="Precipitation" v={`${c.precipitation} mm`} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-semibold">Next 12 hours</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {hours.map((h) => (
            <div key={h.t} className="glass min-w-24 rounded-2xl p-4 text-center">
              <p className="text-sm text-muted-foreground">{h.t.slice(11, 16)}</p>
              <p className="my-2 text-3xl">{describe(h.code)[1]}</p>
              <p className="font-display text-xl font-semibold"><Temp c={h.temp} /></p>
              <p className="text-xs text-rain">💧 {h.rain ?? 0}%</p>
            </div>
          ))}
        </div>
      </section>
      <CityMap lat={place.latitude} lon={place.longitude} name={place.name} />
    </div>
  );
}
