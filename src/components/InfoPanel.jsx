import '../styles/InfoPanel.css'

function InfoPanel({
  selectedLocation,
  startingPoint,
  onConfirmStartingPoint,
  onResetLocation,
}) {
  return (
    <div className="info-panel">
      {/* Header */}
      <h2>Starting Point</h2>

      {/* Show message if no location selected */}
      {!selectedLocation && !startingPoint && (
        <div className="info-empty">
          <p>Click anywhere on the map to select a starting point.</p>
        </div>
      )}

      {/* Show selected location details if user has clicked */}
      {selectedLocation && (
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
            className="btn btn-primary"
            onClick={onConfirmStartingPoint}
          >
            Use this as my starting point
          </button>
        </div>
      )}

      {/* Show confirmed starting point */}
      {startingPoint && (
        <div className="info-confirmed">
          <h3>✓ Starting Point Confirmed</h3>
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
          <button className="btn btn-secondary" onClick={onResetLocation}>
            Reset starting point
          </button>
        </div>
      )}

      {/* Show both sections if user has selected a new location while one is confirmed */}
      {selectedLocation && startingPoint && (
        <div className="info-new-selection">
          <hr />
          <h3>New Location Selected</h3>
          <p>
            You can click the button below to update your starting point to this
            new location.
          </p>
          <button
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
