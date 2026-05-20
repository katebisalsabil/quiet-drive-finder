# Quiet Drive Finder

Quiet Drive Finder is a beginner-friendly personal React app for finding calmer round-trip driving routes near a selected starting point.

The app runs fully in the browser. It uses Leaflet and OpenStreetMap for the map, and TomTom Routing API for real driving route shapes, distance, drive time, and traffic delay.

## Current Features

- Interactive Leaflet map with OpenStreetMap tiles.
- Click the map to choose a starting point.
- Confirm, update, or reset the starting point.
- Choose a route radius: 5, 10, 15, or 20 miles.
- Generate 3 real round-trip route options with TomTom.
- Show route cards with distance, drive time, traffic delay, and destination coordinates.
- Label the current best quiet route.
- Hover a route card to lightly preview that route on the map.
- Click a route card to select and zoom to that route.
- Clear routes without clearing the starting point.
- Regenerate fresh route options using the current radius.
- Show loading and error messages while routes are requested.

## Tech Stack

- React
- Vite
- JavaScript
- Leaflet
- React Leaflet
- OpenStreetMap tiles
- TomTom Routing API
- ESLint

No backend, database, user accounts, or paid services were added.

## Environment Variables

Create a local `.env` file in the project root:

```bash
VITE_TOMTOM_API_KEY=your_real_tomtom_key_here
```

The real `.env` file is ignored by Git and should not be committed. The safe template file is `.env.example`.

Important: because this is a browser-only app, the TomTom key is used by frontend code. The app does not print the key in the UI or console, but a public production app should use TomTom account restrictions or a backend later.

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open the local URL shown by Vite, usually:

```text
http://localhost:5173/
```

## Test The App

1. Start the app with `npm run dev`.
2. Click the map to place a blue selected-location marker.
3. Click `Use this as my starting point`.
4. Choose a radius in the Route Generator panel.
5. Click `Generate Real Routes`.
6. Wait for TomTom to return route options.
7. Hover route cards to preview lines on the map.
8. Click a route card to select it and zoom the map to that route.
9. Click `Regenerate Routes` to request a fresh set.
10. Click `Clear Routes` to remove routes while keeping the starting point.
11. Click `Reset Starting Point` to start over.

## Useful Commands

```bash
npm run lint
npm run build
```

## Folder Structure

- `src/` contains the React app.
- `src/components/` contains UI components.
- `src/styles/` contains component CSS.
- `src/utils/` contains route generation and TomTom helper code.
- `public/Docs/` contains the project phase docs and reference guide.
- `.env.example` shows the required environment variable name.
- `.gitignore` protects local secrets, build output, and dependencies.

## Current Status

The project is still intentionally simple and local. It has moved beyond basic route drawing into route-quality cleanup, but it is not a full production traffic-ranking app yet.

Future improvements could include address search, stronger traffic/busy-road scoring, better mobile polish, and TomTom key restrictions before public deployment.
