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
  noticeMessage,
  hasRoutes,
}) {
  // State for the selected radius (in miles)
  const [selectedRadius, setSelectedRadius] = useState(20)
  const [avoidHighways, setAvoidHighways] = useState(false)
  const [preferLocalRoads, setPreferLocalRoads] = useState(false)
  const [selectedDriveTime, setSelectedDriveTime] = useState(30)

  // Radius options available to the user
  const radiusOptions = [5, 10, 15, 20]
  const driveTimeOptions = [20, 30]

  function getRouteOptions() {
    return {
      avoidHighways,
      preferLocalRoads,
      driveTimeMinutes: selectedDriveTime,
    }
  }

  // Handle the "Generate Round Trip Routes" button click
  const handleGenerateClick = () => {
    if (!startingPoint) {
      return
    }
    onGenerateRoutes(startingPoint, selectedRadius, getRouteOptions())
  }

  // Handle the "Regenerate Routes" button click
  const handleRegenerateClick = () => {
    onRegenerateRoutes(selectedRadius, getRouteOptions())
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

          <div className="radius-selector">
            <label htmlFor="drive-time-input">
              <strong>Maximum round-trip drive time:</strong>
            </label>
            <select
              id="drive-time-input"
              value={selectedDriveTime}
              onChange={(e) => setSelectedDriveTime(Number(e.target.value))}
              className="radius-dropdown"
            >
              {driveTimeOptions.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} minutes
                </option>
              ))}
            </select>
          </div>

          <p className="radius-description">
            Will look for up to 3 real round-trip routes near, but not over, your {selectedDriveTime}-minute max.
          </p>

          <label className="avoid-highways-option">
            <input
              type="checkbox"
              checked={avoidHighways}
              onChange={(event) => setAvoidHighways(event.target.checked)}
              disabled={isGenerating}
            />
            <span>
              <strong>Avoid highways</strong>
              <small>TomTom will try to avoid motorways when possible.</small>
            </span>
          </label>

          <label className="avoid-highways-option">
            <input
              type="checkbox"
              checked={preferLocalRoads}
              onChange={(event) => setPreferLocalRoads(event.target.checked)}
              disabled={isGenerating}
            />
            <span>
              <strong>Prefer local roads</strong>
              <small>Quiet scoring gives extra weight to routes with fewer highway hints and smoother roads.</small>
            </span>
          </label>

          {/* Primary action: generate real round-trip routes */}
          <button
            type="button"
            className="btn btn-generate"
            onClick={handleGenerateClick}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating round trips...' : 'Generate Round Trip Routes'}
          </button>

          {isGenerating && (
            <p className="loading-message" aria-live="polite">
              Asking TomTom for route options
              {avoidHighways || preferLocalRoads ? ' that avoid highways when possible' : ''} within your {selectedDriveTime}-minute max. This may check several destination points.
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

      {noticeMessage && !errorMessage && (
        <div className="notice-message" aria-live="polite">
          <p>{noticeMessage}</p>
        </div>
      )}
    </div>
  )
}

export default RouteGenerator
