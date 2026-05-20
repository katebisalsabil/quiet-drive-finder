# Codex Prompt Library

## How to Use These Prompts
Before each phase, attach or paste:
1. `00_READ_THIS_BEFORE_EVERY_CODEX_PROMPT.md`
2. The current phase section from `02_PHASE_PLAN.md`
3. The specific prompt below

Tell Codex to only work on the current phase.

---

## Phase 1 Prompt: Project Setup
```text
I am an absolute beginner. Please help me complete Phase 1 only for my Quiet Drive Finder project.

Use React + Vite with JavaScript, not TypeScript.
Explain each terminal command before I run it.
Do not add map features yet.
Help me confirm the app runs locally.
Then help me initialize Git and push the first version to GitHub.
```

---

## Phase 2 Prompt: Basic Map
```text
Please help me complete Phase 2 only: add a basic interactive map.

Use Leaflet and React Leaflet.
Keep the code simple and beginner-friendly.
Tell me exactly which packages to install.
Tell me exactly which files to edit.
Add comments in the code.
Do not add routing or traffic yet.
At the end, give me the Git commands to commit and push.
```

---

## Phase 3 Prompt: Home Location / Pinpoint
```text
Please help me complete Phase 3 only: let me choose my home/start location.

Add a marker when I click on the map.
Add a "Use My Location" button using browser geolocation.
Show the selected latitude and longitude.
Keep the code simple.
Do not add routing yet.
At the end, give me the Git commands to commit and push.
```

---

## Phase 4 Prompt: Radius and Candidate Points
```text
Please help me complete Phase 4 only: add a radius and generate candidate points.

Add an input for radius in miles, default 20.
Generate 3 to 5 candidate points around the home marker within the radius.
Show those points on the map.
Keep it simple and explain the math in comments.
Do not connect to a routing API yet.
At the end, give me the Git commands to commit and push.
```

---

## Phase 5 Prompt: Routing API
```text
Please help me complete Phase 5 only: connect to the routing API and draw real routes.

Use TomTom API.
Use `.env` for the API key.
Do not hard-code the key.
Create or update `.env.example`.
Make sure `.env` is ignored by Git.
Request a route from home to a candidate point and back home.
Draw the route line on the map.
Keep the code beginner-friendly with comments.
At the end, give me the Git commands to commit and push.
```

---

## Phase 6 Prompt: Traffic / Least Busy Ranking
```text
Please help me complete Phase 6 only: compare route options and choose the least busy route.

Use available route time and traffic delay data from the routing/traffic API.
Generate multiple candidate routes.
Rank them by least delay and reasonable drive time.
Highlight the best route clearly.
Show a small explanation for why it was selected.
Keep the code simple and well-commented.
At the end, give me the Git commands to commit and push.
```

---

## Phase 7 Prompt: Polish
```text
Please help me complete Phase 7 only: polish the app for personal use.

Add loading messages, error messages, and clearer layout.
Make the interface beginner-friendly.
Clean up unused code.
Do not add unnecessary new packages.
Help me test the full app flow.
At the end, give me the Git commands to commit and push.
```
