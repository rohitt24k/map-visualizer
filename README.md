This project, named **map-visualizer**, is a Next.js application designed to visualize and analyze data on a map. It allows users to draw polygons on a map, configure them with different datasets (such as temperature, wind, and precipitation), and apply custom color rules based on the data values. The application also includes a timeline feature to view data for a single point in time or an average over a range.

---

### Getting Started

To get started with this project, you need to run the development server.

1.  Clone the repository.
2.  Install the dependencies using your preferred package manager (npm, yarn, pnpm, or bun).
3.  Run the development server.

<!-- end list -->

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The application will be available at `http://localhost:3000`.

---

### Key Technologies

This project is built using the following core technologies:

- **Next.js**: A React framework for building server-side rendered and static web applications.
- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Mapbox GL JS**: A JavaScript library for vector maps on the web, used here for the interactive map interface.
- **Mapbox Draw**: A plugin for Mapbox GL JS that provides tools for drawing and editing features on the map.
- **Zustand**: A small, fast, and scalable state-management solution for React.
- **shadcn/ui & Radix UI**: A collection of reusable components for building the user interface, with accessibility in mind.
- **Tailwind CSS**: A utility-first CSS framework for styling components.

---

### File Structure Overview

The project follows a standard Next.js directory structure with a focus on component-based architecture and clear separation of concerns.

- `src/app/`: Contains the main application layout and page components.
- `src/components/`: Houses all reusable React components, including UI primitives.
- `src/hooks/`: Contains custom React hooks for specific logic, like map initialization and state detection.
- `src/lib/`: Holds utility functions and client-side setup for external libraries.
- `src/services/`: Defines services for external API interactions, such as fetching weather data.
- `src/stores/`: Manages the application's global state using Zustand.
- `src/types/`: Contains all TypeScript type definitions for the project's data structures.
- `src/utils/`: Provides utility functions for calculations and data formatting.
- `public/`: Stores static assets like images and SVG icons.

---

### Core Functionality

#### **State Management (`src/stores/dashboard-store.ts`)**

The application's state is managed using `zustand`. The `useDashboardStore` hook provides access to and actions for modifying the global state, which includes:

- **Timeline**: Manages the playback mode (`single` or `range`), the currently selected time or range, and the playback state (`isPlaying`).
- **Map**: Stores the map's center coordinates, zoom level, and whether a polygon is currently being drawn.
- **Polygons**: An array of `PolygonData` objects, each containing information about a drawn polygon.
- **Weather Cache**: Caches fetched weather data to prevent redundant API calls.
- **Loading and Error States**: Tracks loading and error status for asynchronous operations.

#### **Map Integration (`src/hooks/use-map.ts`)**

The `useMap` hook is the central point for all map-related logic. It initializes the Mapbox GL map, handles map events (like movement and drawing), and manages the Mapbox Draw tool.

- `initializeMap`: Sets up the map instance, loads the style, and adds the drawing controls. It also listens for the `draw.create` event to handle new polygons.
- `startDrawing`: Puts the map into polygon-drawing mode.
- `resetView`: Resets the map to its initial center and zoom level.
- `updatePolygonLayers`: This function is called to dynamically update the visual representation of polygons on the map, including their color and labels, based on the current data and color rules.

#### **Weather Data Service (`src/services/weather-api.ts`)**

The `WeatherService` class is a singleton that interacts with the Open-Meteo API to fetch weather data. It includes caching to optimize performance.

- `fetchWeatherData`: Fetches hourly weather data for a given latitude and longitude for a 30-day period. It supports different datasets like temperature, wind, cloud, and precipitation.
- `getValueForTime`: Retrieves the weather value for a specific hour from the fetched data.
- `getAverageForRange`: Calculates the average weather value over a specified time range.

#### **Polygon Utilities (`src/utils/polygon-utils.ts`)**

This file contains helper functions for working with polygon data.

- `calculatePolygonCentroid`: Computes the geographical center of a polygon.
- `calculatePolygonArea`: Calculates the approximate area of a polygon in square kilometers.
- `getPolygonColorFromRules`: Determines the color of a polygon based on its current value and a set of user-defined color rules. It handles different conditions and prioritizes rules correctly.
- `formatDatasetValue`: Formats a numerical value with the correct unit and precision for display.
- `getDefaultColorRules`: Provides a set of default color rules for new polygons.

---

### Components

- `MapContainer`: The main component that renders the map interface, including the map controls, drawing mode indicator, and a loading state.
- `ConfigurationSidebar`: A sidebar component that houses the drawing tools and the list of active polygons.
- `TimelineSlider`: The header component that provides controls for the data timeline, including playback, mode selection, and time display.
- `PolygonList`: A component within the sidebar that displays a list of all active polygons and provides actions like editing and deleting them.
- `ColorRuleModal`: A modal component that allows users to configure the name, dataset, and color rules for a selected polygon.
- **UI Components**: The project uses a library of custom UI components for consistency and accessibility, including `Button`, `Input`, `Select`, `Dialog`, `Popover`, `ScrollArea`, `Tabs`, and `Slider`.
