# Quiet Drive Finder

Quiet Drive Finder is a beginner-friendly personal web app for finding peaceful, less busy round-trip driving routes near home.

## Project purpose

This app is a simple starting point for a route planning tool that will eventually help you choose quiet driving loops.

## Tech stack

- React
- Vite
- JavaScript
- ESLint
- Leaflet (map library)
- React Leaflet (React wrapper for Leaflet)
- OpenStreetMap (map tiles)

## Phase progress

### Phase 1: Setup ✓ Complete
- Created Vite React app.
- Set up Git repository.
- Updated documentation.

### Phase 2: Basic Map ✓ Complete
- Installed Leaflet and React Leaflet.
- Created a full-page interactive map.
- Added a starting marker at Sterling Heights, Michigan.
- Map uses OpenStreetMap tiles.
- Fixed styling so the map fills the entire screen.
- Added comments to the code for beginner understanding.

### Phase 3: Home Location / Pinpoint ✓ Complete
- User can click anywhere on the map to select a location.
- Temporary marker (blue) appears at the clicked location.
- Info panel shows the latitude and longitude of the selected location.
- "Use this as my starting point" button confirms the selection.
- Confirmed marker (green) appears and stays on the map.
- "Reset starting point" button clears the selection.
- Map centered on Sterling Heights, Michigan by default.
- Info panel displays on the right side of the screen.

### Phase 4: Route Generator ✓ Complete
- Radius selector with options: 5, 10, 15, and 20 miles.
- "Generate Drive Ideas" button generates 3-5 random destination points.
- Destination points are scattered within the selected radius from the starting point.
- Route preview lines drawn on the map (start → destination → start).
- Each route shown with a green line (or red when highlighted).
- Orange destination markers show where each route goes.
- Route list panel shows each generated route with:
  - Route number
  - Approximate round-trip distance in miles
  - Destination latitude and longitude coordinates
- Error message shown if user tries to generate routes without selecting a starting point first.
- Hover over a route in the list to highlight it on the map.
- Simple math-based point generation (no routing APIs called yet).

### Phase 5: Routing API
- Create TomTom developer account.
- Add API key to `.env`.
- Create API helper file.
- Request 3 real driving routes from start → destination → start.
- Draw real route lines on the map using TomTom directions.
- Show distance, estimated time, and traffic delay for each route.
- Highlight the best quiet route using a simple score.

### Phase 6: Traffic / Least Busy Ranking
- Use traffic-aware route data if available.
- Compare route time and delay.
- Rank routes from best to worst.
- Highlight the best route.

### Phase 7: Polish and Personal Use
- Add loading states.
- Add error messages.
- Improve layout.
- Add instructions inside the app.
- Clean up unused code.
- Test the app from start to finish.

## How to install dependencies

1. Open a terminal in the project folder.
2. Run:

```bash
npm install
```

## How to run locally

Start the development server with:

```bash
npm run dev
```

Then open the URL shown in the terminal, usually:

```bash
http://127.0.0.1:4173/
```

The app will display an interactive map centered on Sterling Heights, Michigan with three info panels on the right side.

## Environment variables and API keys

This project uses a `.env` file to store private values like API keys.

- `.env` is a local file that is not uploaded to GitHub.
- `VITE_TOMTOM_API_KEY=` is the placeholder key name used by Vite.
- Do not put a real key in this file if you will share the project publicly.

Vite makes `.env` values available in your app using `import.meta.env`.
For example, `import.meta.env.VITE_TOMTOM_API_KEY` can read the key value in your code.

This keeps the key private and helps prevent uploading secrets to GitHub.

### How to test Phase 5 features:

1. **Set up a starting point:**
   - Click anywhere on the map to select a location.
   - A blue marker will appear where you clicked.
   - Click the green "Use this as my starting point" button in the top info panel.
   - The marker will turn green (confirming it's your starting point).

2. **Generate real routes:**
   - In the Route Generator panel, choose a radius from the dropdown.
   - Click the green "Generate Real Routes" button.
   - The app will request 3 real driving routes from TomTom for each candidate.

3. **View real routes on the map:**
   - Colored lines will appear showing the actual route geometry.
   - Orange markers show where each destination is.
   - The best route will be highlighted more strongly.

4. **View route details in the list:**
   - The Route List panel shows each generated route.
   - Each route displays:
     - Route number (Route 1, Route 2, etc.)
     - Distance in miles
     - Estimated drive time in minutes
     - Traffic delay in seconds
     - Destination latitude and longitude

5. **Highlight a route:**
   - Hover your mouse over a route in the list.
   - That route's line will turn red and become thicker on the map.
   - The best quiet route is also clearly labeled.

6. **Try a different radius:**
   - Change the radius selector in the Route Generator panel.
   - Click "Generate Real Routes" again.
   - New TomTom route options will be requested for the new radius.

7. **Handle loading and errors:**
   - The button will show a loading state while routes are requested.
   - If the TomTom API fails, an error message will appear in the Route Generator panel.

8. **Normal map controls still work:**
   - Zoom in and out with the mouse wheel or +/- buttons.
   - Pan the map by clicking and dragging.
   - Click a marker's popup to see detailed information.

## Git workflow

A simple Git workflow for this project is:

1. Create a branch for your work:

```bash
git checkout -b phase-4-route-generator
```

2. Add changes:

```bash
git add .
```

3. Commit with a clear message:

```bash
git commit -m "Phase 4: add route generator"
```

4. Push your branch:

```bash
git push -u origin phase-4-route-generator
```

5. Open a pull request when you are ready.

## Future API note

Phase 5 now uses TomTom routing to request three real driving routes for each destination candidate. Each route includes distance, estimated drive time, and traffic delay, and the app chooses the best quiet route from the available options.

## Folder structure

- `src/` contains the React application code.
- `src/components/` contains React components like the Map.
- `src/styles/` contains CSS files for components.
- `public/` contains static files and documentation.
- `public/Docs/` contains project documentation and phase plans.
- `index.html` and `vite.config.js` are required Vite files and should be kept.
- `node_modules/` is generated by `npm install` and should not be committed.
- `dist/` is the build output folder and should not be committed.
