import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboard-store";
import { ColorRule, PolygonData, SupportedDataset } from "@/types";
import { nanoid } from "nanoid";
import { getUpdatedPolygonCurrentValue } from "@/lib/utils";

interface ColorRuleModalProps {
  polygonId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ColorRuleModal({
  polygonId,
  isOpen,
  onClose,
}: ColorRuleModalProps) {
  const { timeline, polygons, updatePolygon, setLoading } = useDashboardStore();

  const polygon = polygons.find((p) => p.id === polygonId);
  const [rules, setRules] = useState<ColorRule[]>(polygon?.colorRules || []);
  const [name, setName] = useState(polygon?.name ?? "");
  const [datasetKey, setDatasetKey] = useState(
    polygon?.dataset.key ?? "temperature"
  );

  const handleAddRule = () => {
    const newRule: ColorRule = {
      id: nanoid(),
      condition: ">",
      value: 0,
      color: "#3B82F6",
    };
    setRules([...rules, newRule]);
  };

  const handleUpdateRule = (id: string, updates: Partial<ColorRule>) => {
    setRules(
      rules.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule))
    );
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id));
  };

  const handleSave = async () => {
    onClose();

    const updates: Partial<PolygonData> = {
      name,
      dataset: {
        key: datasetKey,
        unit: polygon?.dataset.unit ?? "",
      },
      colorRules: rules,
    };
    setLoading(true);

    if (polygon && datasetKey !== polygon?.dataset.key) {
      const val = await getUpdatedPolygonCurrentValue({
        polygon: {
          ...polygon,
          dataset: {
            key: datasetKey,
            unit: polygon?.dataset.unit ?? "",
          },
        },
        timeline: timeline,
      });

      updates.currentValue = val;
    }

    setLoading(false);

    updatePolygon(polygonId, updates);
  };

  const handleCancel = () => {
    setRules(polygon?.colorRules || []);
    onClose();
  };

  if (!polygon) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure polygon values</DialogTitle>
          {/* <p className="text-sm text-gray-600">
            Set temperature thresholds and colors for <span className="font-medium">{polygon.name}</span>
          </p> */}
          <p className="text-sm text-gray-600">
            Edit the values for{" "}
            <span className="font-medium">{polygon.name}</span>
          </p>
        </DialogHeader>

        <div className="max-h-[500px] overflow-y-auto">
          <div className=" space-y-4 px-1">
            <div className=" space-y-2 ">
              <div>
                <label>
                  <span className=" text-sm text-gray-600 "> Name:</span>
                  <Input
                    className=" !ring-transparent "
                    placeholder="Enter a name"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                  />
                </label>
              </div>
              <div>
                <label>
                  <span className=" text-sm text-gray-600 "> Dataset:</span>
                  <Select
                    value={datasetKey}
                    onValueChange={(e) => {
                      setDatasetKey(e as SupportedDataset);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="wind">Wind</SelectItem>
                      <SelectItem value="cloud">Cloud</SelectItem>
                      <SelectItem value="precipitation">
                        Precipitation
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>
            </div>
            <div>
              {rules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No color rules defined</p>
                  <p className="text-xs mt-1">
                    Add rules to color polygons based on temperature
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                    >
                      <input
                        type="color"
                        value={rule.color}
                        onChange={(e) =>
                          handleUpdateRule(rule.id, { color: e.target.value })
                        }
                        className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                      />

                      <Select
                        value={rule.condition}
                        onValueChange={(value: ColorRule["condition"]) =>
                          handleUpdateRule(rule.id, { condition: value })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="<">Less than</SelectItem>
                          <SelectItem value="<=">Less than or equal</SelectItem>
                          <SelectItem value="=">Equal to</SelectItem>
                          <SelectItem value=">=">
                            Greater than or equal
                          </SelectItem>
                          <SelectItem value=">">Greater than</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        value={rule.value}
                        onChange={(e) =>
                          handleUpdateRule(rule.id, {
                            value: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-16"
                        step="0.1"
                      />

                      <span className="text-sm text-gray-600">°C</span>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleAddRule}
            className="w-full mt-4 border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Color Rule
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Rules</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
