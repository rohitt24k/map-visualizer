export type SupportedDataset =
  | "temperature"
  | "wind"
  | "cloud"
  | "precipitation";

export const DatasetUnitMap: Record<SupportedDataset, string> = {
  temperature: "°C",
  wind: "km/h",
  cloud: "%",
  precipitation: "mm",
};

export interface PolygonData {
  id: string;
  name: string;
  points: [number, number][]; // [lat, lng] coordinates
  area?: number;
  centroid?: [number, number];
  currentValue?: number;
  colorRules: ColorRule[];

  dataset: {
    key: SupportedDataset;
    unit: string; // "°C", "%", "km/h", "mm", etc.
  };
}

export interface ColorRule {
  id: string;
  condition: "<" | "<=" | "=" | ">=" | ">";
  value: number;
  color: string;
}

export interface WeatherApiResponse {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    temperature_2m?: number[];
    humidity_2m?: number[];
    wind_speed_10m?: number[];
    cloud_cover?: number[];
    precipitation?: number[];
  };
}

export interface TimelineState {
  mode: "single" | "range";
  selectedTime: number; // hours from start (0-720)
  selectedRange: [number, number];
  isPlaying: boolean;
}

export interface MapState {
  center: [number, number];
  zoom: number;
  isDrawing: boolean;
  selectedPolygonId: string | null;
}

export interface DashboardState {
  timeline: TimelineState;
  map: MapState;
  polygons: PolygonData[];
  weatherCache: Record<string, WeatherApiResponse>;
  isLoading: boolean;
  isMapInitialized: boolean;
  error: string | null;
}
