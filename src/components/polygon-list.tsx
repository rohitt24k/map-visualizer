import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboard-store";
import {
  formatDatasetValue,
  getPolygonColorFromRules,
} from "@/utils/polygon-utils";
import { ColorRuleModal } from "@/components/color-rule-modal";
import { ScrollArea } from "./ui/scroll-area";

export function PolygonList() {
  const {
    polygons,
    deletePolygon,
    setSelectedPolygon,
    map: { selectedPolygonId },
  } = useDashboardStore();

  const [editingPolygonId, setEditingPolygonId] = React.useState<string | null>(
    null
  );

  const handleDeletePolygon = (id: string) => {
    if (confirm("Are you sure you want to delete this polygon?")) {
      deletePolygon(id);
      if (selectedPolygonId === id) {
        setSelectedPolygon(null);
      }
    }
  };

  const handleEditColorRules = (id: string) => {
    setEditingPolygonId(id);
  };

  if (polygons.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Active Polygons</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            0
          </span>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No polygons created yet</p>
          <p className="text-xs mt-1">
            Draw polygons on the map to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Active Polygons</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {polygons.length}
          </span>
        </div>

        <ScrollArea>
          <div className=" space-y-3 ">
            {polygons.map((polygon) => {
              const polygonColor =
                polygon.currentValue !== undefined
                  ? getPolygonColorFromRules(
                      polygon.currentValue,
                      polygon.colorRules
                    )
                  : "#94A3B8";

              return (
                <div
                  key={polygon.id}
                  className={`polygon-item p-3 border rounded-lg transition-all duration-200 cursor-pointer ${
                    selectedPolygonId === polygon.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedPolygon(polygon.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full transition-colors duration-300"
                        style={{ backgroundColor: polygonColor }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">
                        {polygon.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditColorRules(polygon.id);
                        }}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePolygon(polygon.id);
                        }}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 mb-2">
                    <div>
                      <span className=" capitalize ">
                        {polygon.dataset.key}
                      </span>
                      :{" "}
                      <span
                        className="font-medium"
                        style={{ color: polygonColor }}
                      >
                        {polygon.currentValue !== undefined
                          ? formatDatasetValue(
                              polygon.currentValue,
                              polygon.dataset.key
                            )
                          : "Loading..."}
                      </span>
                    </div>
                    <div>
                      Points:{" "}
                      <span className="font-medium">
                        {polygon.points.length}
                      </span>
                      {polygon.area && (
                        <>
                          {" | "}Area:{" "}
                          <span className="font-medium">
                            {polygon.area} km²
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Color Rules Preview */}
                  <div className="mt-3">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">
                      Color Rules
                    </h4>
                    <div className="space-y-1">
                      {polygon.colorRules.slice(0, 3).map((rule) => (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-gray-600">
                            {rule.condition} {rule.value}°C
                          </span>
                          <div className="flex items-center space-x-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: rule.color }}
                            ></div>
                          </div>
                        </div>
                      ))}
                      {polygon.colorRules.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{polygon.colorRules.length - 3} more rules
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditColorRules(polygon.id);
                      }}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Edit Rules
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {editingPolygonId && (
        <ColorRuleModal
          polygonId={editingPolygonId}
          isOpen={true}
          onClose={() => setEditingPolygonId(null)}
        />
      )}
    </>
  );
}
