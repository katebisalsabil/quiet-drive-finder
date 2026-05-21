# Quiet Drive Finder

Quiet Drive Finder is a beginner-friendly personal React app for finding calmer round-trip driving routes near a selected starting point.

The app runs fully in the browser. It uses Leaflet and OpenStreetMap for the map, and TomTom APIs for address search, real driving route shapes, distance, drive time, and traffic delay.

## Current Features

- Interactive Leaflet map with OpenStreetMap tiles.
- TomTom address/place search for addresses, businesses, schools, stores, and landmarks.
- Click the map to choose a starting point.
- Confirm, update, or reset the starting point.
- Choose a route radius: 5, 10, 15, or 20 miles.
- Choose a maximum round-trip drive time: 20 or 30 minutes.
- Prefer routes close to that maximum while never showing routes over it.
- Use closer destination candidates for 20-minute drives and slightly farther candidates for 30-minute drives.
- Optionally ask TomTom to avoid highways when possible.
- Optionally prefer local roads when ranking quieter routes.
- Generate up to 3 real round-trip route options with TomTom.
- Show route cards with round-trip time, max time, distance, traffic delay, and destination coordinates.
- Explain that quiet scoring uses traffic, road type, turns, and route overlap.
- Label the current best quiet route.
- Hover a route card to lightly preview that route on the map.
- Click a route card to select and zoom to that route.
- Open any generated route in Google Maps directions for navigation.
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
- TomTom Search API
- ESLint

No backend, database, or user accounts were added.

## Environment Variables

Create a local `.env` file in the project root:

```bash
VITE_TOMTOM_API_KEY=your_real_tomtom_key_here
```

The real `.env` and `.env.local` files are ignored by Git and should not be committed. The safe template file is `.env.example`.

Important: because this is a browser-only app, the TomTom key is used by frontend code. The app does not print the key in the UI or console, but a public production app should use account restrictions or a backend later.

## Address Search

The `Search address or place` box uses TomTom Search API with the same `VITE_TOMTOM_API_KEY` used for routing. Type an address or place name, press Enter or click `Search`, then choose one of the results. The selected result becomes the confirmed starting point and moves the Leaflet map there.

If the key is missing, the app shows `Search API key missing.` If no result is found, it shows `No location found. Try a more specific address.`

## Google Maps Navigation Links

Each route card has an `Open in Google Maps` button. This uses a regular Google Maps directions URL, not the Google Maps API, so it does not need a Google API key.

The link sends Google Maps:

- the starting point as the origin
- the generated destination point as a waypoint
- a few TomTom route-shape points as extra waypoints when available
- the same starting point again as the final destination

Google Maps may slightly adjust the route because it recalculates directions with its own road data.

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
3. Or search for a place like `Macomb Community College` in `Search address or place`, then choose a result.
4. If you clicked the map instead, click `Use this as my starting point`.
5. Choose a radius in the Route Generator panel.
6. Choose `20 minutes` or `30 minutes` for the maximum round-trip drive time.
7. Optional: check `Avoid highways` or `Prefer local roads`.
8. Click `Generate Round Trip Routes`.
9. Wait for TomTom to return route options within the selected max time.
10. Hover route cards to preview lines on the map.
11. Click a route card to select it and zoom the map to that route.
12. Click `Open in Google Maps` on a route card to open round-trip directions in a new tab.
13. Click `Regenerate Routes` to request a fresh set.
14. Click `Clear Routes` to remove routes while keeping the starting point.
15. Click `Reset Starting Point` to start over.

## Final Testing Checklist

Use this checklist before saving or pushing a phase:

- `npm run lint` passes.
- `npm run build` passes.
- `.env` does not appear in `git status`.
- `.env.local` does not appear in `git status`.
- The app opens with `npm run dev`.
- The map loads and can be moved/zoomed.
- Searching `Macomb Community College` returns TomTom results.
- Selecting a TomTom search result sets the starting point and moves the map there.
- Clicking the map shows a selected starting point.
- Confirming the starting point enables route generation.
- The maximum round-trip drive time selector offers `20 minutes` and `30 minutes`.
- `Generate Round Trip Routes` shows a loading message.
- Routes appear on the map and in the route list.
- Route cards show round-trip time as `X min of Y min max`, plus distance, traffic delay, and destination coordinates.
- Generated routes stay within the selected maximum time limit.
- The best quiet route is selected from traffic delay, highway hints, turn count, overlap, and max-time fit.
- If there are not enough valid routes, the app explains that fewer than 3 routes were found.
- If only shorter routes are found, the app explains that they are still under the selected limit.
- `Prefer local roads` can be toggled before generating or regenerating.
- Route cards include a quiet score explanation.
- The best quiet route is labeled.
- Hovering a route card lightly highlights the route.
- Clicking a route card zooms to that route.
- `Open in Google Maps` opens a new tab with start, destination/waypoints, and final return to start.
- `Avoid highways` can be toggled before generating or regenerating.
- `Regenerate Routes`, `Clear Routes`, and `Reset Starting Point` work.
- If TomTom fails or the key is missing, the app shows a helpful message without showing the API key.

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
