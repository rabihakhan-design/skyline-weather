import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { airQuery, aqiLevel, citySearch, DEFAULT_CITY } from "@/lib/weather";
import { CityMap } from "@/components/CityMap";
import { CitySearch, PageError, Stat } from "@/components/CitySearch";

export const Route = createFileRoute("/air-quality")({
  validateSearch: citySearch,
  loaderDeps: ({ search }) => ({ city: search.city ?? DEFAULT_CITY }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(airQuery(deps.city)),
  head: () => ({
    meta: [
      { title: "Air Quality Index — Skyline Weather" },
      { name: "description", content: "Live air quality index (AQI) and pollutant levels like PM2.5 and ozone." },
      { property: "og:title", content: "Air Quality Index — Skyline Weather" },
      { property: "og:description", content: "Check the air you breathe: live AQI and pollutants." },
    ],
  }),
  errorComponent: PageError,
  component: AirPage,
});

const tones = { good: "aqi-good", fair: "aqi-fair", poor: "aqi-poor", bad: "aqi-bad" };

function AirPage() {
  const city = Route.useSearch().city ?? DEFAULT_CITY;
  const { data } = useSuspenseQuery(airQuery(city));
  const a = data.air.current;
  const lvl = aqiLevel(a.us_aqi);

  return (
    <div className="space-y-8">
      <CitySearch city={city} to="/air-quality" />
      <section className="glass animate-rise flex flex-col items-center gap-6 rounded-[2rem] p-10 text-center md:flex-row md:text-left">
        <div className={`${tones[lvl.tone]} flex h-40 w-40 shrink-0 flex-col items-center justify-center rounded-full`}>
          <span className="font-display text-5xl font-bold">{Math.round(a.us_aqi)}</span>
          <span className="text-xs uppercase tracking-widest">US AQI</span>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Air quality in {data.place.name}</p>
          <h1 className="font-display text-4xl font-bold">{lvl.label}</h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            {lvl.tone === "good"
              ? "Air is clean — a great day to be outside."
              : "Sensitive people should limit long outdoor activity."}
          </p>
        </div>
      </section>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Stat k="PM2.5" v={`${a.pm2_5} µg/m³`} />
        <Stat k="PM10" v={`${a.pm10} µg/m³`} />
        <Stat k="Ozone (O₃)" v={`${a.ozone} µg/m³`} />
        <Stat k="Nitrogen dioxide" v={`${a.nitrogen_dioxide} µg/m³`} />
        <Stat k="Sulphur dioxide" v={`${a.sulphur_dioxide} µg/m³`} />
        <Stat k="Carbon monoxide" v={`${a.carbon_monoxide} µg/m³`} />
      </div>
      <CityMap lat={data.place.latitude} lon={data.place.longitude} name={data.place.name} />
    </div>
  );
}
