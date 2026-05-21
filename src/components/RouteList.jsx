import '../styles/RouteList.css'

function formatTrafficDelay(seconds) {
  if (!seconds) {
    return 'No delay reported'
  }

  if (seconds < 60) {
    return `${seconds} sec`
  }

  return `${Math.round(seconds / 60)} min`
}

function RouteList({ routes, onRouteHover, onRouteSelect, selectedRouteId }) {
  return (
    <div className="route-list-panel">
      <h2>Generated Routes</h2>

      {/* Show message if no routes generated */}
      {routes.length === 0 && (
        <div className="empty-state">
          <p>No routes generated yet. Click "Generate Real Routes" to create some options!</p>
        </div>
      )}

      {/* Show list of routes */}
      {routes.length > 0 && (
        <div className="routes-container">
          <p className="route-count">
            {routes.length} route option{routes.length === 1 ? '' : 's'} generated
          </p>
          <p className="route-hint">Hover to preview. Click a card to zoom to that route.</p>
          <ul className="route-items">
            {routes.map((route) => (
              <li
                key={route.id}
                className={`route-item ${selectedRouteId === route.id ? 'selected' : ''} ${route.isBest ? 'best' : ''}`}
                onMouseEnter={() => onRouteHover(route.id)}
                onMouseLeave={() => onRouteHover(null)}
                onFocus={() => onRouteHover(route.id)}
                onBlur={() => onRouteHover(null)}
                onClick={() => onRouteSelect(route.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onRouteSelect(route.id)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={selectedRouteId === route.id}
                aria-label={`Select route ${route.id}`}
                >
                  <div className="route-strip" style={{ backgroundColor: route.color }} />
                  <div className="route-header">
                    <div>
                      <h3>Route {route.id}</h3>
                      <div className="route-labels">
                        {route.isBest && <span className="best-label">Best quiet route</span>}
                        {route.avoidHighways && <span className="option-label">Avoids highways</span>}
                      </div>
                    </div>
                    <span className="distance-badge">{route.distanceMiles} mi</span>
                  </div>
                  <div className="route-details">
                    <div className="route-stat-grid">
                      <div>
                        <span>Drive time</span>
                        <strong>{route.travelTimeMinutes} min</strong>
                      </div>
                      <div>
                        <span>Traffic delay</span>
                        <strong>{formatTrafficDelay(route.trafficDelaySeconds)}</strong>
                      </div>
                    </div>
                    <p className="destination-label">
                      <strong>Destination</strong>
                    </p>
                    <p className="route-coordinates">
                      {route.destination.lat.toFixed(4)}, {route.destination.lng.toFixed(4)}
                    </p>
                    <p className="route-description">
                      Real TomTom route from your starting point and back.
                    </p>
                  </div>
                </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default RouteList
