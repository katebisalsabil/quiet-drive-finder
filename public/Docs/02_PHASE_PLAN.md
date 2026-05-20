# Quiet Drive Finder - Phase Plan

## Phase 1: Project Setup
Goal: Create the basic React app and save it with Git/GitHub.

Tasks:
- Create Vite React app.
- Open project in VS Code.
- Run app locally.
- Initialize Git.
- Create GitHub repository.
- Push first commit.

Success Check:
- App opens in browser.
- GitHub has the project files.

Suggested Commit Message:
```bash
git commit -m "Phase 1 setup React app"
```

---

## Phase 2: Basic Map
Goal: Show an interactive map.

Tasks:
- Install Leaflet and React Leaflet.
- Add Leaflet CSS.
- Create a simple Map component.
- Display the map in the app.

Success Check:
- Browser shows an interactive map.
- Map can zoom and move.

Suggested Commit Message:
```bash
git commit -m "Phase 2 add basic map"
```

---

## Phase 3: Home Location / Pinpoint
Goal: Let the user choose the starting location.

Tasks:
- Add map click to place a home marker.
- Add button to use browser geolocation.
- Save selected coordinates in app state.
- Display selected latitude/longitude.

Success Check:
- User can click map and see home marker.
- "Use My Location" works if browser permission is allowed.

Suggested Commit Message:
```bash
git commit -m "Phase 3 add home location marker"
```

---

## Phase 4: Radius and Candidate Points
Goal: Generate possible route target points within the radius.

Tasks:
- Add radius input, default 20 miles.
- Generate several points around home within radius.
- Show candidate points on the map.
- Keep this phase simple; no real routing yet.

Success Check:
- Candidate points appear around home.
- Radius can be changed.

Suggested Commit Message:
```bash
git commit -m "Phase 4 generate candidate drive points"
```

---

## Phase 5: Routing API
Goal: Connect to a routing API and draw real routes.

Tasks:
- Create TomTom developer account.
- Add API key to `.env`.
- Create API helper file.
- Request routes from home to candidate point and back home.
- Draw route lines on the map.

Success Check:
- At least one real route line appears on the map.
- API key is not visible in GitHub.

Suggested Commit Message:
```bash
git commit -m "Phase 5 add routing API"
```

---

## Phase 6: Traffic / Least Busy Ranking
Goal: Compare routes and choose the least busy option.

Tasks:
- Use traffic-aware route data if available.
- Compare route time and delay.
- Rank routes from best to worst.
- Highlight the best route.

Success Check:
- App labels one route as best.
- User can see why the route was chosen.

Suggested Commit Message:
```bash
git commit -m "Phase 6 rank least busy routes"
```

---

## Phase 7: Polish and Personal Use
Goal: Make the app comfortable to use.

Tasks:
- Add loading states.
- Add error messages.
- Improve layout.
- Add instructions inside the app.
- Clean up unused code.
- Test the app from start to finish.

Success Check:
- App is usable without confusion.
- No major console errors.

Suggested Commit Message:
```bash
git commit -m "Phase 7 polish app"
```
