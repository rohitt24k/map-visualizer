import { weatherService } from "@/services/weather-api";
import { PolygonData, TimelineState } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getUpdatedPolygonCurrentValue = async ({
  polygon,
  timeline,
}: {
  polygon: PolygonData;
  timeline: TimelineState;
}): Promise<number | undefined> => {
  if (!polygon.centroid) return;

  const [lat, lng] = polygon.centroid;

  try {
    const weatherData = await weatherService.fetchWeatherData(lat, lng, [
      polygon.dataset.key,
    ]);

    let temperature: number;
    if (timeline.mode === "single") {
      temperature = weatherService.getValueForTime(
        weatherData,
        polygon.dataset.key,
        timeline.selectedTime
      );
    } else {
      temperature = weatherService.getAverageForRange(
        weatherData,
        polygon.dataset.key,
        timeline.selectedRange
      );
    }

    return temperature;
  } catch (error) {
    console.error(
      `Failed to fetch weather data for polygon ${polygon.name}:`,
      error
    );
    return undefined;
  }
};
