import { SupportedDataset, WeatherApiResponse } from "@/types";
import { format, addDays, subDays } from "date-fns";

const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast";

const DatasetKeyMap: Record<SupportedDataset, string> = {
  temperature: "temperature_2m",
  wind: "wind_speed_10m",
  cloud: "cloud_cover",
  precipitation: "precipitation",
};

export class WeatherService {
  private static instance: WeatherService;
  private cache = new Map<string, WeatherApiResponse>();

  static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  async fetchWeatherData(
    latitude: number,
    longitude: number,
    datasetKeys: SupportedDataset[] = ["temperature"]
  ): Promise<WeatherApiResponse> {
    const now = new Date();
    const baseDate = new Date(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    );

    const startDate = subDays(baseDate, 15);
    const endDate = addDays(baseDate, 15);

    const startDateStr = format(startDate, "yyyy-MM-dd");
    const endDateStr = format(endDate, "yyyy-MM-dd");

    const apiKeys = datasetKeys.map((key) => DatasetKeyMap[key]);
    const hourlyParam = apiKeys.join(",");

    const cacheKey = `${latitude.toFixed(4)}_${longitude.toFixed(
      4
    )}_${hourlyParam}_${startDate}_${endDate}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    try {
      const url = new URL(OPEN_METEO_BASE_URL);
      url.searchParams.set("latitude", latitude.toString());
      url.searchParams.set("longitude", longitude.toString());
      url.searchParams.set("start_date", startDateStr);
      url.searchParams.set("end_date", endDateStr);
      url.searchParams.set("hourly", hourlyParam);
      url.searchParams.set("timezone", "auto");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Weather API error: ${response.status} ${response.statusText}`
        );
      }

      const data: WeatherApiResponse = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Failed to fetch weather data:", error);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Weather request timed out. Please try again.");
        }
        if (
          error.message.includes("NetworkError") ||
          error.message.includes("fetch")
        ) {
          throw new Error(
            "Network error. Please check your internet connection."
          );
        }
      }

      throw new Error("Failed to fetch weather data. Please try again.");
    }
  }

  // getTemperatureForTime(data: WeatherApiResponse, timeHours: number): number {
  //   if (!data.hourly?.temperature_2m || !data.hourly?.time) {
  //     throw new Error("Invalid weather data format");
  //   }

  //   const index = Math.min(timeHours, data.hourly.temperature_2m.length - 1);
  //   return data.hourly.temperature_2m[index] || 0;
  // }

  getValueForTime(
    data: WeatherApiResponse,
    dataset: SupportedDataset,
    timeHours: number
  ): number {
    const apiKey = DatasetKeyMap[dataset] as keyof WeatherApiResponse["hourly"];
    const values = data.hourly[apiKey]
      ? (data.hourly[apiKey] as number[])
      : null;

    if (!values || !data.hourly?.time)
      throw new Error(`Dataset "${dataset}" not available`);

    const index = Math.min(timeHours, values.length - 1);
    return parseFloat(values[index].toFixed(2)) || 0;
  }

  // getAverageTemperatureForRange(
  //   data: WeatherApiResponse,
  //   range: [number, number]
  // ): number {
  //   if (!data.hourly?.temperature_2m || !data.hourly?.time) {
  //     throw new Error("Invalid weather data format");
  //   }

  //   const [start, end] = range;
  //   const temperatures = data.hourly.temperature_2m.slice(start, end + 1);

  //   if (temperatures.length === 0) return 0;

  //   const sum = temperatures.reduce((acc, temp) => acc + (temp || 0), 0);
  //   return sum / temperatures.length;
  // }

  getAverageForRange(
    data: WeatherApiResponse,
    dataset: SupportedDataset,
    range: [number, number]
  ): number {
    const apiKey = DatasetKeyMap[dataset] as keyof WeatherApiResponse["hourly"];
    const values = data.hourly[apiKey]
      ? (data.hourly[apiKey] as number[])
      : null;

    if (!values || !data.hourly?.time)
      throw new Error(`Dataset "${dataset}" not available`);

    const [start, end] = range;
    const slice = values.slice(start, end + 1);

    if (slice.length === 0) return 0;

    const sum = slice.reduce((acc, v) => acc + (v ?? 0), 0);
    return parseInt((sum / slice.length).toFixed(2));
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const weatherService = WeatherService.getInstance();
