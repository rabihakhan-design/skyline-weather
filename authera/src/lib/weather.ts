import { queryOptions } from "@tanstack/react-query";

export type Place = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export const DEFAULT_CITY = "Karachi";

async function getJson<T>(url: string): Promise<T> {
  let status = 0;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res.json() as Promise<T>;
    status = res.status;
    if (status < 500 && status !== 429) break;
    await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
  }
  throw new Error(`Weather service is busy right now (${status}). Please try again.`);
}

export async function geocode(city: string): Promise<Place> {
  const data = await getJson<{ results?: Place[] }>(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
  );
  const p = data.results?.[0];
  if (!p) throw new Error(`City "${city}" not found`);
  return p;
}

export type Forecast = {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    pressure_msl: number;
    weather_code: number;
    is_day: number;
    precipitation: number;
  };
  hourly: { time: string[]; temperature_2m: number[]; weather_code: number[]; precipitation_probability: number[] };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    wind_speed_10m_max: number[];
  };
};

export async function getForecast(city: string) {
  const place = await geocode(city);
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,pressure_msl,weather_code,is_day,precipitation` +
    `&hourly=temperature_2m,weather_code,precipitation_probability` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max,wind_speed_10m_max` +
    `&timezone=auto&forecast_days=7`;
  const forecast = await getJson<Forecast>(url);
  return { place, forecast };
}

export type AirQuality = {
  current: {
    us_aqi: number;
    pm2_5: number;
    pm10: number;
    carbon_monoxide: number;
    nitrogen_dioxide: number;
    ozone: number;
    sulphur_dioxide: number;
  };
};

export async function getAirQuality(city: string) {
  const place = await geocode(city);
  const air = await getJson<AirQuality>(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${place.latitude}&longitude=${place.longitude}` +
      `&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide&timezone=auto`,
  );
  return { place, air };
}

export const forecastQuery = (city: string) =>
  queryOptions({ queryKey: ["forecast", city.toLowerCase()], queryFn: () => getForecast(city), staleTime: 5 * 60_000 });

export const airQuery = (city: string) =>
  queryOptions({ queryKey: ["air", city.toLowerCase()], queryFn: () => getAirQuality(city), staleTime: 10 * 60_000 });

const CODES: Record<number, [string, string]> = {
  0: ["Clear sky", "☀️"], 1: ["Mainly clear", "🌤️"], 2: ["Partly cloudy", "⛅"], 3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"], 48: ["Rime fog", "🌫️"], 51: ["Light drizzle", "🌦️"], 53: ["Drizzle", "🌦️"],
  55: ["Dense drizzle", "🌧️"], 61: ["Light rain", "🌦️"], 63: ["Rain", "🌧️"], 65: ["Heavy rain", "🌧️"],
  71: ["Light snow", "🌨️"], 73: ["Snow", "🌨️"], 75: ["Heavy snow", "❄️"], 80: ["Rain showers", "🌦️"],
  81: ["Rain showers", "🌧️"], 82: ["Violent showers", "⛈️"], 95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm, hail", "⛈️"], 99: ["Thunderstorm, hail", "⛈️"],
};
export const describe = (code: number) => CODES[code] ?? ["Unknown", "🌡️"];

export function aqiLevel(aqi: number) {
  if (aqi <= 50) return { label: "Good", tone: "good" as const };
  if (aqi <= 100) return { label: "Moderate", tone: "fair" as const };
  if (aqi <= 150) return { label: "Unhealthy for sensitive groups", tone: "poor" as const };
  if (aqi <= 200) return { label: "Unhealthy", tone: "bad" as const };
  return { label: "Very unhealthy", tone: "bad" as const };
}

export const citySearch = (s: Record<string, unknown>): { city?: string } =>
  typeof s["city"] === "string" && s["city"].trim() ? { city: s["city"].trim() } : {};
