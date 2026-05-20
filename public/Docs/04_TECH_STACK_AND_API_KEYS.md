# Tech Stack and API Keys

## Main Tools

### VS Code
Used to write and edit code.

### Codex in VS Code
Used as the coding assistant. Give it one phase at a time.

### Node.js and npm
Used to create and run the React app.

### React + Vite
Used to build the web app.

### Leaflet / React Leaflet
Used to show the interactive map.

### OpenStreetMap
Used as the basic map tile source.

### TomTom API
Used later for routing and traffic features.

## API Key Safety
Never paste private API keys directly into source code.

Use a `.env` file:

```bash
VITE_TOMTOM_API_KEY=your_api_key_here
```

Then use it in Vite code like:

```javascript
const tomTomApiKey = import.meta.env.VITE_TOMTOM_API_KEY;
```

## Important Git Rule for API Keys
Make sure `.env` is in `.gitignore`.

Example `.gitignore` line:

```text
.env
```

## Safe Template File
Create a public example file called `.env.example`:

```bash
VITE_TOMTOM_API_KEY=replace_with_your_key
```

This file can be pushed to GitHub because it does not contain the real key.
