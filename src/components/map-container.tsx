import React, { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Crosshair } from "lucide-react";
import { useMap } from "@/hooks/use-map";
import { useDashboardStore } from "@/stores/dashboard-store";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";

export function MapContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { startDrawing, resetView } = useMap(containerRef);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const {
    map: mapState,
    polygons,
    isLoading: apiLoading,
    isMapInitialized,
    timeline,
  } = useDashboardStore();

  const isLoading = useMemo(
    () => apiLoading || timeline.isPlaying,
    [apiLoading, timeline.isPlaying]
  );

  return (
    <main className="flex-1 flex flex-col bg-gray-100">
      {/* Map Controls */}
      <div className="bg-white border-b border-gray-200 px-4 pl-16 py-2">
        <div className="flex items-center justify-between flex-wrap ">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              <span className="w-2 h-2 bg-blue-600 rounded-full inline-block mr-1"></span>
              Active Polygons:{" "}
              <span className="font-medium text-blue-600">
                {polygons.length}
              </span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={resetView}>
              <Crosshair className="w-4 h-4 mr-1" />
              Reset View
            </Button>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                >
                  <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                  Draw Polygon
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 mr-2">
                <div className=" space-y-4 ">
                  <div className="space-y-2">
                    <h4 className="leading-none font-medium">Dataset</h4>
                    <p className="text-muted-foreground text-sm">
                      Select a dataset for the polygon
                    </p>
                  </div>
                  <Select
                    onValueChange={(e) => {
                      console.log("Draw button clicked");
                      startDrawing(e);
                      setIsPopoverOpen(false);
                    }}
                  >
                    <SelectTrigger>Select a dataset</SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="wind">Wind</SelectItem>
                      <SelectItem value="cloud">Cloud</SelectItem>
                      <SelectItem value="precipitation">
                        Precipitation
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ minHeight: "500px" }}
        />

        {/* Drawing Mode Indicator */}
        {mapState.isDrawing && (
          <div className="absolute top-4 left-4 bg-white border border-gray-200 rounded-lg p-3 shadow-sm z-10">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-900">
                Drawing Mode Active
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Click to add points (3-12 points)
            </p>
          </div>
        )}

        {/* Map Loading State */}
        {!isMapInitialized && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600 mt-2">Loading map data...</p>
            </div>
          </div>
        )}

        {/* Map Attribution */}
        <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded text-xs text-gray-600">
          © Mapbox © OpenStreetMap
        </div>
      </div>
    </main>
  );
}
