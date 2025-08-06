import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MapPinXInside, Cloud, ChevronRight } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboard-store";
import { PolygonList } from "./polygon-list";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";

interface ConfigurationSidebarProps {
  onStartDrawing: (key: string) => void;
}

export function ConfigurationSidebar({
  onStartDrawing,
}: ConfigurationSidebarProps) {
  const { map: mapState } = useDashboardStore();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [show, setShow] = useState(true);

  return (
    <div className=" relative h-full  ">
      {!show && (
        <Button
          variant="secondary"
          size="sm"
          className=" absolute top-2.5 left-4 h-8 w-8 p-0 cursor-pointer"
          onClick={() => setShow(true)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      <div
        className={` h-full absolute top-0 z-20 ${
          show ? " translate-x-0 " : "-translate-x-full absolute"
        } `}
      >
        <aside className=" h-full w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Configuration
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShow(false)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active Polygons */}
          <div className="flex-1 overflow-y-auto">
            <PolygonList />
          </div>

          {/* Data Source Configuration */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Data Source
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <Cloud className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Open-Meteo
                  </span>
                </div>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  Active
                </span>
              </div>

              <div className="text-xs text-gray-600">
                <div className="flex justify-between mb-1">
                  <span>Field:</span>
                  <span className="font-medium">temperature_2m</span>
                </div>
                <div className="flex justify-between">
                  <span>Update:</span>
                  <span className="font-medium">Real-time</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
