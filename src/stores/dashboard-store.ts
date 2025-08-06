import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DashboardState, PolygonData, ColorRule } from "@/types";
import { nanoid } from "nanoid";

interface DashboardStore extends DashboardState {
  // Timeline actions
  setTimelineMode: (mode: "single" | "range") => void;
  setSelectedTime: (time: number) => void;
  setSelectedRange: (range: [number, number]) => void;
  setIsPlaying: (playing: boolean) => void;

  // Map actions
  setMapCenter: (center: [number, number]) => void;
  setIsDrawing: (drawing: boolean) => void;
  setSelectedPolygon: (id: string | null) => void;

  // Polygon actions
  addPolygon: (polygon: Omit<PolygonData, "id">) => void;
  updatePolygon: (id: string, updates: Partial<PolygonData>) => void;
  deletePolygon: (id: string) => void;
  updatePolygonColorRules: (id: string, rules: ColorRule[]) => void;

  // Weather data actions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setWeatherData: (key: string, data: any) => void;
  setLoading: (loading: boolean) => void;
  setIsMapInitialized: (loading: boolean) => void;
  setError: (error: string | null) => void;
  get: () => DashboardStore;
  // Utility actions
  reset: () => void;
}

const initialState: DashboardState = {
  timeline: {
    mode: "single",
    selectedTime: 360, // Middle of 30-day range (15 days * 24 hours)
    selectedRange: [300, 420],
    isPlaying: false,
  },
  map: {
    center: [22.54111111, 88.33777778], // Kolkata coordinates
    zoom: 10,
    isDrawing: false,
    selectedPolygonId: null,
  },
  polygons: [],
  weatherCache: {},
  isLoading: false,
  isMapInitialized: false,
  error: null,
};

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      get,
      // Timeline actions
      setTimelineMode: (mode) =>
        set((state) => ({
          timeline: { ...state.timeline, mode },
        })),

      setSelectedTime: (time) =>
        set((state) => ({
          timeline: { ...state.timeline, selectedTime: time },
        })),

      setSelectedRange: (range) =>
        set((state) => ({
          timeline: { ...state.timeline, selectedRange: range },
        })),

      setIsPlaying: (playing) =>
        set((state) => ({
          timeline: { ...state.timeline, isPlaying: playing },
        })),

      // Map actions
      setMapCenter: (center) =>
        set((state) => ({
          map: { ...state.map, center },
        })),

      setIsDrawing: (drawing) =>
        set((state) => ({
          map: { ...state.map, isDrawing: drawing },
        })),

      setSelectedPolygon: (id) =>
        set((state) => ({
          map: { ...state.map, selectedPolygonId: id },
        })),

      // Polygon actions
      addPolygon: (polygon) =>
        set((state) => ({
          polygons: [
            ...state.polygons,
            {
              ...polygon,
              id: nanoid(),
            },
          ],
        })),

      updatePolygon: (id, updates) =>
        set((state) => ({
          polygons: state.polygons.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      deletePolygon: (id) =>
        set((state) => ({
          polygons: state.polygons.filter((p) => p.id !== id),
        })),

      updatePolygonColorRules: (id, rules) =>
        set((state) => ({
          polygons: state.polygons.map((p) =>
            p.id === id ? { ...p, colorRules: rules } : p
          ),
        })),

      // Weather data actions
      setWeatherData: (key, data) =>
        set((state) => ({
          weatherCache: { ...state.weatherCache, [key]: data },
        })),

      setLoading: (loading) => set({ isLoading: loading }),
      setIsMapInitialized: (loading) => set({ isMapInitialized: loading }),
      setError: (error) => set({ error }),

      // Utility actions
      reset: () => set(initialState),
    }),
    {
      name: "dashboard-storage",
      partialize: (state) => ({
        // timeline: state.timeline,
        map: state.map,
        polygons: state.polygons,
        weatherCache: state.weatherCache,
      }),
    }
  )
);
