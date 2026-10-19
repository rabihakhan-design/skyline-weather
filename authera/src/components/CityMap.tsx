export function CityMap({ lat, lon, name }: { lat: number; lon: number; name: string }) {
  const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] as string | undefined;
  if (!key) return null;
  const src = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${lat},${lon}&zoom=11`;
  return (
    <section>
      <h2 className="mb-4 font-display text-2xl font-semibold">📍 {name} on the map</h2>
      <div className="glass overflow-hidden rounded-[2rem]">
        <iframe title={`Map of ${name}`} src={src} className="h-80 w-full md:h-[28rem]" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
      </div>
    </section>
  );
}
