import '../styles/RouteList.css'
import { buildGoogleMapsDirectionsUrl } from '../utils/googleMapsUrl'

function formatTrafficDelay(seconds) {
  if (!seconds) {
    return 'No delay reported'
  }

  if (seconds < 60) {
    return `${seconds} sec`
  }

  return `${Math.round(seconds / 60)} min`
}

function formatRoundTripTime(route) {
  const roundedMinutes = Math.round(route.travelTimeSeconds / 60)

  if (!route.driveTimeLimitMinutes) {
    return `${roundedMinutes} min`
  }

  return `${roundedMinutes} min of ${route.driveTimeLimitMinutes} min max`
}

function RouteList({
  routes,
  onRouteHover,
  onRouteSelect,
  selectedRouteId,
  bestQuietRouteId,
}) {
  return (
    <div className="route-list-panel">
      <h2>Generated Routes</h2>

      {/* Show message if no routes generated */}
      {routes.length === 0 && (
        <div className="empty-state">
          <p>No routes generated yet. Click "Generate Round Trip Routes" to create some options!</p>
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
              <RouteCard
                key={route.id}
                route={route}
                isSelected={selectedRouteId === route.id}
                isBestQuietRoute={bestQuietRouteId === route.id}
                onRouteHover={onRouteHover}
                onRouteSelect={onRouteSelect}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function RouteCard({
  route,
  isSelected,
  isBestQuietRoute,
  onRouteHover,
  onRouteSelect,
}) {
  const googleMapsUrl = buildGoogleMapsDirectionsUrl(route)

  return (
    <li
      className={`route-item ${isSelected ? 'selected' : ''} ${isBestQuietRoute ? 'best' : ''}`}
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
      aria-pressed={isSelected}
      aria-label={`Select route ${route.id}`}
    >
      <div className="route-strip" style={{ backgroundColor: route.color }} />
      <div className="route-header">
        <div>
          <h3>Route {route.id}</h3>
          <div className="route-labels">
            {isSelected && <span className="selected-label">Selected route</span>}
            {isBestQuietRoute && <span className="best-label">Best quiet route</span>}
            {route.avoidHighways && <span className="option-label">Avoids highways</span>}
            {route.preferLocalRoads && <span className="option-label">Prefers local roads</span>}
          </div>
        </div>
        <span className="distance-badge">{route.distanceMiles} mi</span>
      </div>
      <div className="route-details">
        <div className="route-stat-grid">
          <div>
            <span>Round-trip time:</span>
            <strong>{formatRoundTripTime(route)}</strong>
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
        <p className="quiet-score-note">
          {route.quietScoreExplanation || 'Quiet score based on traffic, road type, and overlap.'}
        </p>
        <button
          type="button"
          className="google-maps-button"
          onClick={(event) => {
            event.stopPropagation()
            window.open(googleMapsUrl, '_blank', 'noopener,noreferrer')
          }}
          onKeyDown={(event) => {
            event.stopPropagation()
          }}
        >
          Open in Google Maps
        </button>
        <p className="google-maps-note">
          Google Maps may slightly adjust the route.
        </p>
      </div>
    </li>
  )
}

export default RouteList
