import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { useDashboardStore } from "@/stores/dashboard-store";
import {
  calculatePolygonCentroid,
  calculatePolygonArea,
  getDefaultColorRules,
  getPolygonColorFromRules,
} from "@/utils/polygon-utils";
import type { GeoJSON } from "geojson";
import { DatasetUnitMap, SupportedDataset } from "@/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function useMap(containerRef: React.RefObject<HTMLDivElement | null>) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  const currentPolygonDatasetKey = useRef<string>("");

  const {
    map: mapState,
    polygons,
    setMapCenter,
    setIsDrawing,
    isMapInitialized,
    setIsMapInitialized,
    addPolygon,
  } = useDashboardStore();

  const initializeMap = useCallback(() => {
    if (!containerRef.current || isMapInitialized) return;

    if (!MAPBOX_TOKEN) {
      console.error("Mapbox access token is not set");
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/standard",
      center: [mapState.center[1], mapState.center[0]],
      zoom: 12,
      maxZoom: 14,
      minZoom: 10,
    });

    mapRef.current = map;

    map.once("idle", () => {
      console.log("Map is fully idle and ready.");
      setIsMapInitialized(true);
    });

    map.on("load", () => {
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {},
        modes: { ...MapboxDraw.modes },
      });

      drawRef.current = draw;
      map.addControl(draw);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.on("draw.create", (e: any) => {
        const feature = e.features[0];

        if (feature.geometry.type === "Polygon") {
          const coordinates = feature.geometry.coordinates[0];
          const coords = coordinates.slice(0, -1); // remove duplicate last point
          const points: [number, number][] = coords.map(
            ([lng, lat]: [number, number]) => [lat, lng]
          );

          if (points.length >= 3 && points.length <= 12) {
            const centroid = calculatePolygonCentroid(points);
            const area = calculatePolygonArea(points);
            const key =
              (currentPolygonDatasetKey.current as SupportedDataset) ??
              "temperature";

            addPolygon({
              name: `Polygon ${polygons.length + 1}`,
              points,
              colorRules: getDefaultColorRules(),
              centroid,
              area,
              dataset: {
                key,
                unit: DatasetUnitMap[key],
              },
            });
          }
        }

        drawRef.current?.deleteAll();
        setIsDrawing(false);
      });
    });

    map.on("moveend", () => {
      const center = map.getCenter();
      setMapCenter([center.lat, center.lng]);
    });
  }, [
    containerRef,
    mapState.center,
    addPolygon,
    polygons.length,
    setIsDrawing,
    setIsMapInitialized,
    setMapCenter,
    isMapInitialized,
  ]);

  const startDrawing = useCallback(
    (datasetKey: string) => {
      if (drawRef.current && mapRef.current) {
        drawRef.current.deleteAll(); // clear existing drawings
        drawRef.current.changeMode("draw_polygon"); // start fresh polygon
        setIsDrawing(true);
        currentPolygonDatasetKey.current = datasetKey;
      }
    },
    [setIsDrawing]
  );

  const resetView = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [mapState.center[1], mapState.center[0]],
        zoom: mapState.zoom,
        duration: 1000,
      });
    }
  }, [mapState.center, mapState.zoom]);

  const updatePolygonLayers = useCallback(() => {
    if (!isMapInitialized || !mapRef.current || !mapRef.current.isStyleLoaded())
      return;

    polygons.forEach((polygon) => {
      const layerId = `polygon-${polygon.id}`;
      const borderLayerId = `polygon-${polygon.id}-border`;
      const sourceId = `polygon-source-${polygon.id}`;
      const labelLayerId = `${layerId}-label`;

      const map = mapRef.current!;
      const coordinates = [...polygon.points.map(([lat, lng]) => [lng, lat])];
      coordinates.push(coordinates[0]);

      const geojson: GeoJSON = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [coordinates],
        },
        properties: {
          id: polygon.id,
          name: polygon.name,
          currentValue: polygon.currentValue,
          datasetName: polygon.dataset.key,
          datasetUnit: DatasetUnitMap[polygon.dataset.key],
        },
      };

      const fillColor =
        polygon.currentValue !== undefined && polygon.colorRules
          ? getPolygonColorFromRules(polygon.currentValue, polygon.colorRules)
          : "#3B82F6";

      try {
        // If source doesn't exist, add it and add layers
        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: "geojson",
            data: geojson,
          });

          map.addLayer({
            id: layerId,
            type: "fill",
            source: sourceId,
            paint: {
              "fill-color": fillColor,
              "fill-opacity": 0.4,
            },
          });

          map.addLayer({
            id: borderLayerId,
            type: "line",
            source: sourceId,
            paint: {
              "line-color": "#1E40AF",
              "line-width": 2,
            },
          });

          map.addLayer({
            id: labelLayerId,
            type: "symbol",
            source: sourceId,
            layout: {
              "text-field": [
                "concat",
                ["get", "name"],
                "\n",
                ["get", "datasetName"],
                ": ",
                ["to-string", ["get", "currentValue"]],
                ["get", "datasetUnit"],
              ],
              "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
              "text-size": 14,
              "text-anchor": "center",
            },
            paint: {
              "text-color": "#111827", // Tailwind slate-900
              "text-halo-color": "#ffffff",
              "text-halo-width": 1,
            },
          });
        } else {
          // Update existing data + paint
          const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
          source.setData(geojson);

          map.setPaintProperty(layerId, "fill-color", fillColor);
        }
      } catch (error) {
        console.error("Error updating polygon:", polygon.id, error);
      }
    });
  }, [polygons, isMapInitialized]);

  useEffect(() => {
    initializeMap();
    // return () => {
    //   mapRef.current?.remove();
    //   mapRef.current = null;
    //   drawRef.current = null;
    //   setIsMapInitialized(false);
    // };
  }, [initializeMap, setIsMapInitialized]);

  useEffect(() => {
    updatePolygonLayers();
  }, [updatePolygonLayers]);

  useEffect(() => {
    if (!isMapInitialized || !mapRef.current) return;

    const current = mapRef.current.getCenter();
    const [targetLat, targetLng] = mapState.center;

    // Only update if center is different
    if (
      Math.abs(current.lat - targetLat) > 0.00001 ||
      Math.abs(current.lng - targetLng) > 0.00001
    ) {
      mapRef.current.flyTo({
        center: [targetLng, targetLat], // Mapbox expects [lng, lat]
        zoom: mapState.zoom,
        duration: 800,
      });
    }
  }, [mapState.center, mapState.zoom, isMapInitialized]);

  return {
    map: mapRef.current,
    draw: drawRef.current,
    startDrawing,
    resetView,
  };
}
