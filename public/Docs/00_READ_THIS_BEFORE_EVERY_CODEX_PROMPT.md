# Quiet Drive Finder - Read This Before Every Codex Prompt

## Project Summary
Build a personal web app called **Quiet Drive Finder**. The app helps the user find a less busy round-trip driving route starting from home and returning home, usually within a 20-mile radius.

## User Skill Level
The user is an absolute beginner. Codex must:
- Explain each step clearly.
- Use simple JavaScript, not TypeScript.
- Avoid unnecessary advanced patterns.
- Add comments in the code.
- Change only what is needed for the current phase.
- Tell the user exactly which file to edit and where.
- Give terminal commands one at a time or in small groups.

## Preferred Tech Stack
- React with Vite
- JavaScript
- Leaflet for map display
- OpenStreetMap map tiles for the base map
- TomTom API later for routing/traffic features
- Git + GitHub for saving work
- VS Code with Codex

## App Features, Eventually
1. Show an interactive map.
2. Let the user enter or pin a home address/location.
3. Let the user choose a radius, default 20 miles.
4. Generate possible round-trip driving routes from home back to home.
5. Compare route options using traffic/busy-road information.
6. Highlight the least busy/best long-drive route.
7. Show route details such as time, distance, and traffic delay.

## Important Rule
Build one phase at a time. Do not build the full app in one prompt.

## Git Rule
At the end of every working phase, commit and push changes:

```bash
git add .
git commit -m "Describe the phase completed"
git push
```

## Environment Variable Rule
Do not hard-code API keys in source code. Use a `.env` file for private keys and keep `.env` out of GitHub.

## Coding Style
- Keep file structure simple.
- Prefer readable names over clever code.
- Use comments for beginner understanding.
- Do not add paid services unless clearly optional.
- When adding new packages, explain why they are needed.
