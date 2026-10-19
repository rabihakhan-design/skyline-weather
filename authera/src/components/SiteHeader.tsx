import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { usePrefs } from "@/lib/prefs";

const NAV = [
  ["/", "Today"],
  ["/forecast", "Forecast"],
  ["/air-quality", "Air Quality"],
  ["/compare", "Compare"],
  ["/favorites", "Saved"],
  ["/about", "About"],
  ["/contact", "Contact"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { unit, setUnit } = usePrefs();

  const links = NAV.map(([to, label]) => (
    <Link
      key={to}
      to={to}
      onClick={() => setOpen(false)}
      className="nav-link rounded-full px-4 py-2"
      activeOptions={{ exact: true, includeSearch: false }}
      activeProps={{ className: "nav-active" }}
    >
      {label}
    </Link>
  ));

  return (
    <header className="mx-auto max-w-6xl px-6 py-6">
      <div className="flex items-center justify-between gap-4">
        <Link to="/" className="font-display text-2xl font-bold">
          ☀️ Skyline<span className="text-sun">.</span>
        </Link>
        <nav className="glass hidden gap-1 rounded-full p-1 text-sm lg:flex">{links}</nav>
        <div className="flex items-center gap-2">
          <div className="glass flex rounded-full p-1 text-sm" role="group" aria-label="Temperature unit">
            {(["C", "F"] as const).map((u) => (
              <button key={u} onClick={() => setUnit(u)} aria-pressed={unit === u} className={`nav-link rounded-full px-3 py-1.5 ${unit === u ? "nav-active" : ""}`}>
                °{u}
              </button>
            ))}
          </div>
          <button className="btn-ghost rounded-full px-4 py-2 lg:hidden" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {open && <nav className="glass animate-rise mt-4 flex flex-col gap-1 rounded-3xl p-2 lg:hidden">{links}</nav>}
    </header>
  );
}
