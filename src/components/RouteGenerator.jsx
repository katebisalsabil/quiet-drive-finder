import { useState } from 'react'
import '../styles/RouteGenerator.css'

function RouteGenerator({
  startingPoint,
  onGenerateRoutes,
  onClearRoutes,
  onRegenerateRoutes,
  onResetStartingPoint,
  isGenerating,
  errorMessage,
  hasRoutes,
}) {
  // State for the selected radius (in miles)
  const [selectedRadius, setSelectedRadius] = useState(20)

  // Radius options available to the user
  const radiusOptions = [5, 10, 15, 20]

  // Handle the "Generate Real Routes" button click
  const handleGenerateClick = () => {
    if (!startingPoint) {
      return
    }
    onGenerateRoutes(startingPoint, selectedRadius)
  }

  // Handle the "Regenerate Routes" button click
  const handleRegenerateClick = () => {
    onRegenerateRoutes(selectedRadius)
  }

  return (
    <div className="route-generator-panel">
      <h2>Route Generator</h2>

      {/* Show error if no starting point selected */}
      {!startingPoint && (
        <div className="error-message" aria-live="polite">
          <p>Please click the map and confirm a starting point first.</p>
        </div>
      )}

      {/* Show the radius selection if starting point exists */}
      {startingPoint && (
        <div className="generator-controls">
          <div className="radius-selector">
            <label htmlFor="radius-input">
              <strong>Choose a radius:</strong>
            </label>
            <select
              id="radius-input"
              value={selectedRadius}
              onChange={(e) => setSelectedRadius(Number(e.target.value))}
              className="radius-dropdown"
            >
              {radiusOptions.map((miles) => (
                <option key={miles} value={miles}>
                  {miles} miles
                </option>
              ))}
            </select>
          </div>

          <p className="radius-description">
            Will request 3 real driving routes using TomTom from your starting
            point and back.
          </p>

          {/* Primary action: Generate real routes */}
          <button
            type="button"
            className="btn btn-generate"
            onClick={handleGenerateClick}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating real routes...' : 'Generate Real Routes'}
          </button>

          {isGenerating && (
            <p className="loading-message" aria-live="polite">
              Asking TomTom for route options. This can take a few seconds.
            </p>
          )}

          {/* Secondary controls: Regenerate and Clear Routes */}
          <div className="button-group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleRegenerateClick}
              disabled={isGenerating}
              title="Generate a fresh set of routes using the same radius"
            >
              Regenerate Routes
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClearRoutes}
              disabled={isGenerating || !hasRoutes}
              title="Remove all routes but keep your starting point"
            >
              Clear Routes
            </button>
          </div>

          {/* Reset: Goes back to the start */}
          <button
            type="button"
            className="btn btn-danger"
            onClick={onResetStartingPoint}
            disabled={isGenerating}
            title="Clear starting point and all routes - start over from the beginning"
          >
            Reset Starting Point
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="error-message" aria-live="polite">
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  )
}

export default RouteGenerator
