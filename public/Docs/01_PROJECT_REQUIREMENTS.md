# Quiet Drive Finder - Project Requirements

## Main Goal
Create a beginner-friendly personal web app that helps choose a calm, less busy route for a round-trip long drive from home.

## User Story
As a user, I want to set my home location, choose a driving radius, and see suggested round-trip routes so I can pick a less busy path for a relaxing long drive.

## Core Requirements

### Required Feature 1: Map
- Show an interactive map.
- The user can zoom and move around.
- The map should initially load near the user's general area or a default location.

### Required Feature 2: Home Location
The user should be able to set home/start location by one or more of these methods:
- Clicking on the map.
- Pressing a "Use My Location" button.
- Entering an address later when geocoding is added.

### Required Feature 3: Radius
- User can choose a radius.
- Default radius: 20 miles.
- Radius should be adjustable later.

### Required Feature 4: Round-Trip Routes
- Route starts at home.
- Route goes to one or more generated points within the radius.
- Route returns to home.

### Required Feature 5: Compare Routes
- Generate multiple candidate routes.
- Compare estimated drive time, traffic delay, and route quality.
- Highlight the best route.

### Required Feature 6: Route Details
For each route, eventually show:
- Estimated time.
- Distance.
- Traffic delay if available.
- Why the route was selected.

## Beginner Requirement
Every phase must be easy to understand, easy to test, and easy to save with Git.

## Out of Scope for the First Version
Do not build these at the beginning:
- User accounts.
- Payments.
- Database.
- Mobile app.
- Complex AI route scoring.
- Full deployment.

## Privacy Requirement
The user's home address is sensitive. For personal use, keep it local in the browser unless the user intentionally sends it to an API for geocoding or routing.
