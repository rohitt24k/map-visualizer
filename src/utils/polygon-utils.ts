import { ColorRule } from "@/types";

export function calculatePolygonCentroid(
  points: [number, number][]
): [number, number] {
  if (points.length === 0) return [0, 0];

  let x = 0;
  let y = 0;

  for (const [lat, lng] of points) {
    x += lat;
    y += lng;
  }

  return [x / points.length, y / points.length];
}

export function calculatePolygonArea(points: [number, number][]): number {
  if (points.length < 3) return 0;

  let area = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i][0] * points[j][1];
    area -= points[j][0] * points[i][1];
  }

  area = Math.abs(area) / 2;

  // Convert to approximate km² (rough conversion for display)
  return Number((area * 111.32 * 111.32).toFixed(2));
}

// export function getPolygonColorFromRules(temperature: number, rules: ColorRule[]): string {
//   // Sort rules by value to ensure proper evaluation order
//   const sortedRules = [...rules].sort((a, b) => a.value - b.value);

//   for (const rule of sortedRules) {
//     switch (rule.condition) {
//       case '<':
//         if (temperature < rule.value) return rule.color;
//         break;
//       case '<=':
//         if (temperature <= rule.value) return rule.color;
//         break;
//       case '=':
//         if (Math.abs(temperature - rule.value) < 0.1) return rule.color;
//         break;
//       case '>=':
//         if (temperature >= rule.value) return rule.color;
//         break;
//       case '>':
//         if (temperature > rule.value) return rule.color;
//         break;
//     }
//   }

//   // Default color if no rules match
//   return '#94A3B8'; // gray-400
// }

export function getPolygonColorFromRules(
  temperature: number,
  rules: ColorRule[]
): string {
  // Handle edge cases
  if (!rules || rules.length === 0) {
    return "#94A3B8"; // gray-400
  }

  if (typeof temperature !== "number" || !isFinite(temperature)) {
    return "#94A3B8"; // gray-400
  }

  // Filter out invalid rules
  const validRules = rules.filter(
    (rule) =>
      rule &&
      typeof rule.value === "number" &&
      isFinite(rule.value) &&
      ["<", "<=", "=", ">=", ">"].includes(rule.condition) &&
      typeof rule.color === "string" &&
      rule.color.trim() !== ""
  );

  if (validRules.length === 0) {
    return "#94A3B8"; // gray-400
  }

  // Separate rules by condition type for proper evaluation order
  const exactRules = validRules.filter((rule) => rule.condition === "=");
  const lessThanRules = validRules.filter(
    (rule) => rule.condition === "<" || rule.condition === "<="
  );
  const greaterThanRules = validRules.filter(
    (rule) => rule.condition === ">" || rule.condition === ">="
  );

  // Check exact matches first (highest priority)
  for (const rule of exactRules) {
    if (Math.abs(temperature - rule.value) < 0.001) {
      // Using smaller epsilon for better precision
      return rule.color;
    }
  }
  // For less than conditions, we want the rule with the lowest value that still matches
  // Sort in ascending order and take the first match (most restrictive rule wins)
  const sortedLessThan = lessThanRules.sort((a, b) => a.value - b.value);
  for (const rule of sortedLessThan) {
    if (rule.condition === "<" && temperature < rule.value) {
      return rule.color;
    }
    if (rule.condition === "<=" && temperature <= rule.value) {
      return rule.color;
    }
  }

  // For greater than conditions, we want the rule with the highest value that still matches
  // Sort in descending order and take the first match (most restrictive rule wins)
  const sortedGreaterThan = greaterThanRules.sort((a, b) => b.value - a.value);
  for (const rule of sortedGreaterThan) {
    if (rule.condition === ">=" && temperature >= rule.value) {
      return rule.color;
    }
    if (rule.condition === ">" && temperature > rule.value) {
      return rule.color;
    }
  }

  // Default color if no rules match
  return "#94A3B8"; // gray-400
}

export function validatePolygonPoints(points: [number, number][]): boolean {
  return points.length >= 3 && points.length <= 12;
}

// export function formatTemperature(temp: number): string {
//   return `${temp.toFixed(1)}°C`;
// }

export function formatDatasetValue(
  value: number,
  datasetKey: "temperature" | "humidity" | "wind" | "precipitation" | "cloud"
): string {
  const precision = 1;

  switch (datasetKey) {
    case "temperature":
      return `${value.toFixed(precision)}°C`;
    case "humidity":
      return `${value.toFixed(precision)}%`;
    case "wind":
      return `${value.toFixed(precision)} km/h`;
    case "precipitation":
      return `${value.toFixed(precision)} mm`;
    case "cloud":
      return `${value.toFixed(precision)}%`;
    default:
      return value.toString();
  }
}

export function getDefaultColorRules(): ColorRule[] {
  return [
    {
      id: nanoid(),
      condition: "<",
      value: 10,
      color: "#EF4444", // red-500
    },
    {
      id: nanoid(),
      condition: ">=",
      value: 10,
      color: "#F59E0B", // yellow-500
    },
    {
      id: nanoid(),
      condition: ">",
      value: 20,
      color: "#10B981", // green-500
    },
  ];
}

import { nanoid as generateId } from "nanoid";

function nanoid(): string {
  return generateId();
}
