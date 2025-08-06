"use client";

import React, { useEffect } from "react";
import { TimelineSlider } from "@/components/timeline-slider";
import { MapContainer } from "@/components/map-container";
import { ConfigurationSidebar } from "@/components/configuration-sidebar";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useMap } from "@/hooks/use-map";
import { getUpdatedPolygonCurrentValue } from "@/lib/utils";

export default function Dashboard() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { startDrawing } = useMap(containerRef);

  const { timeline, polygons, setLoading, setError, updatePolygon } =
    useDashboardStore();

  // Update polygon temperatures when timeline changes
  useEffect(() => {
    const updatePolygonValues = async () => {
      if (polygons.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        // Process polygons sequentially to avoid overwhelming the API
        for (const polygon of polygons) {
          const val = await getUpdatedPolygonCurrentValue({
            polygon,
            timeline,
          });
          updatePolygon(polygon.id, { currentValue: val });

          // Small delay between requests to be respectful to the API
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error("Failed to update polygon temperatures:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to update weather data"
        );
      } finally {
        setLoading(false);
      }
    };

    // Only update if there are polygons and we're not currently loading
    if (polygons.length === 0) return;

    // Debounce the effect to avoid rapid-fire API calls
    const timeoutId = setTimeout(updatePolygonValues, 0);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timeline.selectedTime,
    timeline.selectedRange,
    timeline.mode,
    polygons.length,
    setLoading,
    setError,
    updatePolygon,
  ]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TimelineSlider />

      <div className="flex-1 flex overflow-auto ">
        <ConfigurationSidebar onStartDrawing={startDrawing} />
        <MapContainer />
      </div>
    </div>
  );
}
