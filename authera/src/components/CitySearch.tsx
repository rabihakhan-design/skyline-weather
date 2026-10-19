import { useNavigate, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { usePrefs } from "@/lib/prefs";

export const POPULAR = ["Karachi", "Lahore", "Islamabad", "Dubai", "London", "New York", "Tokyo"];

type To = "/" | "/forecast" | "/air-quality";

export function CitySearch({ city, to }: { city: string; to: To }) {
  const [value, setValue] = useState(city);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const router = useRouter();
  const { isFavorite, toggleFavorite } = usePrefs();
  const fav = isFavorite(city);

  useEffect(() => setValue(city), [city]);

  const go = (c: string) => navigate({ to, search: { city: c } });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <form
          className="flex min-w-0 flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const v = value.trim();
            if (v.length < 2) return setError("Please type at least 2 letters.");
            setError("");
            go(v);
          }}
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search a city…"
            aria-label="City"
            maxLength={60}
            className="glass min-w-0 flex-1 rounded-full px-5 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <button type="submit" className="btn-sun rounded-full px-6 py-3 font-semibold">
            Search
          </button>
        </form>
        <button
          type="button"
          onClick={() => toggleFavorite(city)}
          aria-pressed={fav}
          className={`btn-ghost rounded-full px-4 py-3 text-sm ${fav ? "is-on" : ""}`}
        >
          {fav ? "★ Saved" : "☆ Save city"}
        </button>
        <button
          type="button"
          disabled={refreshing}
          onClick={async () => {
            setRefreshing(true);
            await qc.invalidateQueries();
            await router.invalidate();
            setRefreshing(false);
          }}
          className="btn-ghost rounded-full px-4 py-3 text-sm"
        >
          {refreshing ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {POPULAR.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => go(c)}
            className={`chip rounded-full px-3 py-1.5 text-sm ${c.toLowerCase() === city.toLowerCase() ? "is-on" : ""}`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PageError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <div className="glass mx-auto mt-10 max-w-lg rounded-3xl p-8 text-center">
      <p className="text-4xl">🌧️</p>
      <h2 className="mt-3 font-display text-xl font-semibold">Couldn't load weather</h2>
      <p className="mt-2 text-muted-foreground">{error instanceof Error ? error.message : "Something went wrong"}</p>
      <div className="mt-5 flex justify-center gap-2">
        <button className="btn-sun rounded-full px-5 py-2 font-semibold" onClick={() => { router.invalidate(); reset(); }}>
          Try again
        </button>
        <button className="btn-ghost rounded-full px-5 py-2" onClick={() => router.navigate({ to: "/" })}>
          Back to Karachi
        </button>
      </div>
    </div>
  );
}

export function Stat({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-5">
      <p className="text-sm text-muted-foreground">{k}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{v}</p>
    </div>
  );
}
