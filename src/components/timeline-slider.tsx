import React, { useEffect, useMemo, useState } from "react";
import { Range } from "react-range";
import { format, addDays, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Clock, CalendarDays } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboard-store";

export function TimelineSlider() {
  const {
    timeline,
    setTimelineMode,
    setSelectedTime,
    setSelectedRange,
    setIsPlaying,
    get,
  } = useDashboardStore();

  const [localTimelineValues, setLocalTimelineValues] = useState(
    timeline.mode === "single"
      ? [timeline.selectedTime]
      : timeline.selectedRange
  );

  const baseDate = useMemo(() => {
    const now = new Date();
    // Ensure we have a valid date
    return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  }, []);

  const startDate = useMemo(() => {
    try {
      return subDays(baseDate, 15);
    } catch (error) {
      console.error("Start date calculation error:", error);
      return new Date(2024, 0, 1); // Fallback date
    }
  }, [baseDate]);

  const formatTimeFromHours = (hours: number): string => {
    try {
      const date = new Date(startDate);
      if (isNaN(date.getTime())) {
        return `Hour ${hours}`;
      }
      const newDate = new Date(date.getTime() + hours * 60 * 60 * 1000);
      if (isNaN(newDate.getTime())) {
        return `Hour ${hours}`;
      }
      return format(newDate, "MMM d, HH:mm");
    } catch (error) {
      console.error("Date formatting error:", error);
      return `Hour ${hours}`;
    }
  };

  const getDateLabels = () => {
    try {
      const labels = [];
      for (let i = 0; i <= 30; i += 7) {
        const date = addDays(startDate, i);
        if (isNaN(date.getTime())) {
          return [
            { position: 0, label: "Start" },
            { position: 168, label: "Week 1" },
            { position: 336, label: "Week 2" },
            { position: 504, label: "Week 3" },
            { position: 672, label: "End" },
          ];
        }
        labels.push({
          position: i * 24,
          label: format(date, "MMM d"),
        });
      }
      return labels;
    } catch (error) {
      console.error("Date label error:", error);
      return [
        { position: 0, label: "Start" },
        { position: 168, label: "Week 1" },
        { position: 336, label: "Week 2" },
        { position: 504, label: "Week 3" },
        { position: 672, label: "End" },
      ];
    }
  };

  const dateLabels = getDateLabels();

  const handleTimelineChange = (values: number[]) => {
    setLocalTimelineValues(values);
  };

  const togglePlayback = () => {
    setIsPlaying(!timeline.isPlaying);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (timeline.mode === "single") {
        setSelectedTime(localTimelineValues[0]);
      } else {
        setSelectedRange([localTimelineValues[0], localTimelineValues[1]]);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [localTimelineValues, setSelectedRange, setSelectedTime, timeline.mode]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (timeline.isPlaying) {
      // Start playback animation
      const initialTime = timeline.selectedTime;
      intervalId = setInterval(() => {
        const currentState = get();
        const currentTime = currentState.timeline.selectedTime;

        const next = currentTime + 1;
        if (next >= 720) {
          setIsPlaying(false);
          if (intervalId) clearInterval(intervalId);
          if (initialTime) setSelectedTime(initialTime);
          return;
        }

        setSelectedTime(next);
        setLocalTimelineValues([next]);
      }, 100); // Update every 100ms for smooth animation
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    timeline.isPlaying,
    get,
    setIsPlaying,
    setSelectedTime,
    timeline.selectedTime,
  ]);

  useEffect(() => {
    setLocalTimelineValues(
      timeline.mode === "single"
        ? [timeline.selectedTime]
        : timeline.selectedRange
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeline.mode]);

  const resetTimeline = () => {
    setSelectedTime(360); // Reset to middle
    setSelectedRange([300, 420]);
    setIsPlaying(false);
  };

  const currentValues =
    timeline.mode === "single" ? [localTimelineValues[0]] : localTimelineValues;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 ">
      <div className="flex flex-wrap gap-y-3 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={timeline.mode === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimelineMode("single")}
              className="h-8"
            >
              <Clock className="w-4 h-4 mr-1" />
              Single Time
            </Button>
            <Button
              variant={timeline.mode === "range" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimelineMode("range")}
              className="h-8"
            >
              <CalendarDays className="w-4 h-4 mr-1" />
              Time Range
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {timeline.mode === "single"
              ? formatTimeFromHours(timeline.selectedTime)
              : `${formatTimeFromHours(
                  timeline.selectedRange[0]
                )} - ${formatTimeFromHours(timeline.selectedRange[1])}`}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={togglePlayback}
            disabled={timeline.mode === "range"}
            className="h-8 w-8 p-0"
          >
            {timeline.isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetTimeline}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <div className="relative mx-12 ">
          <Range
            values={currentValues}
            step={1}
            min={0}
            max={720}
            key={localTimelineValues.length}
            onChange={handleTimelineChange}
            allowOverlap={false}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                className="w-full h-2 bg-gray-200 rounded-full"
                style={props.style}
              >
                {children}
              </div>
            )}
            renderThumb={({ index, props, isDragged }) => (
              <div
                {...props}
                key={props.key}
                className={`group w-5 h-5 bg-blue-600 rounded-full border-2 border-white !outline-none shadow-md ${
                  isDragged ? "!bg-blue-800" : ""
                } transition-colors `}
              >
                <div className=" group-hover:block hidden absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                    {formatTimeFromHours(currentValues[index])}
                  </div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-blue-600 mx-auto"></div>
                </div>
              </div>
            )}
          />

          <div className="flex justify-between mt-4 text-xs text-gray-500 select-none">
            {dateLabels.map((label) => (
              <span
                key={label.position}
                className={`${
                  Math.abs(label.position - timeline.selectedTime) < 24
                    ? "font-medium text-blue-600"
                    : ""
                }`}
              >
                {label.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
