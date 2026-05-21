import '../styles/InfoPanel.css'
import PlaceSearch from './PlaceSearch'

function InfoPanel({
  selectedLocation,
  startingPoint,
  onPlaceSelect,
  onConfirmStartingPoint,
  onResetLocation,
}) {
  const hasSelectedLocation = Boolean(selectedLocation)
  const hasStartingPoint = Boolean(startingPoint)
  const hasNewSelection = hasSelectedLocation && hasStartingPoint

  return (
    <div className="info-panel">
      {/* Header */}
      <h2>Starting Point</h2>

      <PlaceSearch onPlaceSelect={onPlaceSelect} />

      {/* Show message if no location selected */}
      {!hasSelectedLocation && !hasStartingPoint && (
        <div className="info-empty">
          <p>Search for a place above, or click anywhere on the map to select a starting point.</p>
        </div>
      )}

      {/* Show selected location details before a starting point is confirmed */}
      {hasSelectedLocation && !hasStartingPoint && (
        <div className="info-selected">
          <h3>Selected Location</h3>
          <div className="coordinates">
            <p>
              <strong>Latitude:</strong> {selectedLocation.lat.toFixed(6)}
            </p>
            <p>
              <strong>Longitude:</strong> {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConfirmStartingPoint}
          >
            Use this as my starting point
          </button>
        </div>
      )}

      {/* Show confirmed starting point */}
      {hasStartingPoint && (
        <div className="info-confirmed">
          <h3>Starting Point Confirmed</h3>
          {(startingPoint.placeName || startingPoint.address) && (
            <div className="place-details">
              {startingPoint.placeName && (
                <p>
                  <strong>Place:</strong> {startingPoint.placeName}
                </p>
              )}
              {startingPoint.address && (
                <p>
                  <strong>Address:</strong> {startingPoint.address}
                </p>
              )}
            </div>
          )}
          <div className="coordinates">
            <p>
              <strong>Latitude:</strong> {startingPoint.lat.toFixed(6)}
            </p>
            <p>
              <strong>Longitude:</strong> {startingPoint.lng.toFixed(6)}
            </p>
          </div>
          <p className="info-message">
            This is your starting point for calculating quiet routes.
          </p>
          <button type="button" className="btn btn-secondary" onClick={onResetLocation}>
            Reset starting point
          </button>
        </div>
      )}

      {/* Show this if user clicks a new map spot after confirming a start */}
      {hasNewSelection && (
        <div className="info-new-selection">
          <hr />
          <h3>New Location Selected</h3>
          <div className="coordinates">
            <p>
              <strong>Latitude:</strong> {selectedLocation.lat.toFixed(6)}
            </p>
            <p>
              <strong>Longitude:</strong> {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
          <p>
            You can click the button below to update your starting point to this
            new location.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConfirmStartingPoint}
          >
            Update starting point to here
          </button>
        </div>
      )}
    </div>
  )
}

export default InfoPanel
