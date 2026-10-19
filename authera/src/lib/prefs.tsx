import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Unit = "C" | "F";
type Prefs = {
  unit: Unit;
  setUnit: (u: Unit) => void;
  favorites: string[];
  toggleFavorite: (city: string) => void;
  isFavorite: (city: string) => boolean;
};

const Ctx = createContext<Prefs | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<Unit>("C");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const u = localStorage.getItem("sky-unit");
      if (u === "C" || u === "F") setUnitState(u);
      const f = JSON.parse(localStorage.getItem("sky-favs") ?? "[]");
      if (Array.isArray(f)) setFavorites(f.filter((x) => typeof x === "string"));
    } catch {
      /* ignore */
    }
  }, []);

  const setUnit = (u: Unit) => {
    setUnitState(u);
    localStorage.setItem("sky-unit", u);
  };
  const toggleFavorite = (city: string) => {
    setFavorites((prev) => {
      const exists = prev.some((c) => c.toLowerCase() === city.toLowerCase());
      const next = exists ? prev.filter((c) => c.toLowerCase() !== city.toLowerCase()) : [...prev, city];
      localStorage.setItem("sky-favs", JSON.stringify(next));
      return next;
    });
  };
  const isFavorite = (city: string) => favorites.some((c) => c.toLowerCase() === city.toLowerCase());

  return <Ctx.Provider value={{ unit, setUnit, favorites, toggleFavorite, isFavorite }}>{children}</Ctx.Provider>;
}

export function usePrefs() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePrefs must be used inside PrefsProvider");
  return v;
}

export const toUnit = (c: number, unit: Unit) => Math.round(unit === "F" ? (c * 9) / 5 + 32 : c);

export function Temp({ c }: { c: number }) {
  const { unit } = usePrefs();
  return <>{toUnit(c, unit)}°</>;
}
