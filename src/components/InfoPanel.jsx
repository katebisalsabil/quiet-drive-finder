import '../styles/InfoPanel.css'
import PlaceSearch from './PlaceSearch'

function InfoPanel({
  selectedStartingPoint,
  confirmedStartingPoint,
  onPlaceSelect,
  onResetLocation,
}) {
  const hasStartingPoint = Boolean(confirmedStartingPoint)
  const pointToShow = confirmedStartingPoint || selectedStartingPoint

  return (
    <div className="info-panel">
      {/* Header */}
      <h2>Starting point</h2>

      <PlaceSearch onPlaceSelect={onPlaceSelect} />

      {/* Search and map clicks both set the starting point immediately. */}
      {!hasStartingPoint && (
        <div className="info-empty">
          <p>Search for a starting place above, or click the map to set one.</p>
        </div>
      )}

      {/* Show the point that TomTom will use as the start and return point. */}
      {hasStartingPoint && pointToShow && (
        <div className="info-confirmed">
          <h3>Starting point</h3>
          {(pointToShow.placeName || pointToShow.address) && (
            <div className="place-details">
              {pointToShow.placeName && (
                <p>
                  <strong>Place:</strong> {pointToShow.placeName}
                </p>
              )}
              {pointToShow.address && (
                <p>
                  <strong>Address:</strong> {pointToShow.address}
                </p>
              )}
            </div>
          )}
          <div className="coordinates">
            <p>
              <strong>Latitude:</strong> {pointToShow.lat.toFixed(6)}
            </p>
            <p>
              <strong>Longitude:</strong> {pointToShow.lng.toFixed(6)}
            </p>
          </div>
          <p className="info-message">
            Round trips will start here, visit a generated destination, and return here.
          </p>
          <button type="button" className="btn btn-secondary" onClick={onResetLocation}>
            Reset starting point
          </button>
        </div>
      )}
    </div>
  )
}

export default InfoPanel
