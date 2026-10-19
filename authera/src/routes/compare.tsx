import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { describe, forecastQuery } from "@/lib/weather";
import { PageError, Stat } from "@/components/CitySearch";
import { Temp } from "@/lib/prefs";

const pick = (v: unknown, d: string) => (typeof v === "string" && v.trim() ? v.trim() : d);

export const Route = createFileRoute("/compare")({
  validateSearch: (s: Record<string, unknown>): { a?: string; b?: string } => ({
    ...(typeof s["a"] === "string" ? { a: s["a"] } : {}),
    ...(typeof s["b"] === "string" ? { b: s["b"] } : {}),
  }),
  loaderDeps: ({ search }) => ({ a: pick(search.a, "Karachi"), b: pick(search.b, "Lahore") }),
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(forecastQuery(deps.a)),
      context.queryClient.ensureQueryData(forecastQuery(deps.b)),
    ]),
  head: () => ({
    meta: [
      { title: "Compare Cities — Skyline Weather" },
      { name: "description", content: "Compare live weather between two cities side by side." },
      { property: "og:title", content: "Compare Cities — Skyline Weather" },
      { property: "og:description", content: "Side-by-side live weather for any two cities." },
    ],
  }),
  errorComponent: PageError,
  component: Compare,
});

function Compare() {
  const s = Route.useSearch();
  const a = pick(s.a, "Karachi");
  const b = pick(s.b, "Lahore");
  const [ia, setIa] = useState(a);
  const [ib, setIb] = useState(b);
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl font-bold">Compare <span className="text-sun">cities</span></h1>
      <form
        className="glass flex flex-wrap items-center gap-3 rounded-3xl p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (ia.trim() && ib.trim()) navigate({ to: "/compare", search: { a: ia.trim(), b: ib.trim() } });
        }}
      >
        <input aria-label="First city" value={ia} onChange={(e) => setIa(e.target.value)} className="field flex-1" />
        <button type="button" className="btn-ghost rounded-full px-4 py-2" onClick={() => { setIa(ib); setIb(ia); }} aria-label="Swap cities">
          ⇄
        </button>
        <input aria-label="Second city" value={ib} onChange={(e) => setIb(e.target.value)} className="field flex-1" />
        <button type="submit" className="btn-sun rounded-full px-6 py-3 font-semibold">Compare</button>
      </form>
      <div className="grid gap-6 md:grid-cols-2">
        <CityCard city={a} />
        <CityCard city={b} />
      </div>
    </div>
  );
}

function CityCard({ city }: { city: string }) {
  const { data } = useSuspenseQuery(forecastQuery(city));
  const c = data.forecast.current;
  const [label, icon] = describe(c.weather_code);
  return (
    <div className="glass animate-rise rounded-[2rem] p-6">
      <h2 className="font-display text-2xl font-bold">{data.place.name}, <span className="text-sun">{data.place.country}</span></h2>
      <div className="my-4 flex items-center gap-4">
        <span className="text-6xl">{icon}</span>
        <div>
          <p className="font-display text-6xl font-bold"><Temp c={c.temperature_2m} /></p>
          <p className="text-muted-foreground">{label}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat k="Feels like" v={<Temp c={c.apparent_temperature} />} />
        <Stat k="Humidity" v={`${c.relative_humidity_2m}%`} />
        <Stat k="Wind" v={`${Math.round(c.wind_speed_10m)} km/h`} />
        <Stat k="Today high / low" v={<><Temp c={data.forecast.daily.temperature_2m_max[0] ?? 0} /> / <Temp c={data.forecast.daily.temperature_2m_min[0] ?? 0} /></>} />
      </div>
    </div>
  );
}
