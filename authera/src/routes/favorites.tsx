import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { describe, forecastQuery } from "@/lib/weather";
import { Temp, usePrefs } from "@/lib/prefs";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Saved Cities — Skyline Weather" },
      { name: "description", content: "Your saved cities with live weather at a glance." },
      { property: "og:title", content: "Saved Cities — Skyline Weather" },
      { property: "og:description", content: "Keep an eye on the weather in the places you care about." },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const { favorites, toggleFavorite } = usePrefs();
  const [value, setValue] = useState("");

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl font-bold">Saved <span className="text-sun">cities</span></h1>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim().length >= 2) { toggleFavorite(value.trim()); setValue(""); }
        }}
      >
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Add a city…" aria-label="Add city" maxLength={60} className="field flex-1" />
        <button type="submit" className="btn-sun rounded-full px-6 py-3 font-semibold">+ Add</button>
      </form>
      {favorites.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
          No saved cities yet. Add one above or tap "☆ Save city" on any weather page.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((c) => <FavCard key={c} city={c} onRemove={() => toggleFavorite(c)} />)}
        </div>
      )}
    </div>
  );
}

function FavCard({ city, onRemove }: { city: string; onRemove: () => void }) {
  const { data, isLoading, isError } = useQuery(forecastQuery(city));
  return (
    <div className="glass animate-rise rounded-3xl p-5">
      <div className="flex items-start justify-between">
        <h2 className="font-display text-xl font-semibold">{data?.place.name ?? city}</h2>
        <button onClick={onRemove} className="btn-ghost rounded-full px-3 py-1 text-sm" aria-label={`Remove ${city}`}>✕</button>
      </div>
      {isLoading && <p className="mt-4 text-muted-foreground">Loading…</p>}
      {isError && <p className="mt-4 text-destructive">City not found</p>}
      {data && (
        <>
          <div className="my-3 flex items-center gap-3">
            <span className="text-5xl">{describe(data.forecast.current.weather_code)[1]}</span>
            <span className="font-display text-5xl font-bold"><Temp c={data.forecast.current.temperature_2m} /></span>
          </div>
          <p className="text-muted-foreground">{describe(data.forecast.current.weather_code)[0]}</p>
          <div className="mt-4 flex gap-2">
            <Link to="/" search={{ city }} className="chip rounded-full px-3 py-1.5 text-sm">Today</Link>
            <Link to="/forecast" search={{ city }} className="chip rounded-full px-3 py-1.5 text-sm">7 days</Link>
            <Link to="/air-quality" search={{ city }} className="chip rounded-full px-3 py-1.5 text-sm">Air</Link>
          </div>
        </>
      )}
    </div>
  );
}
