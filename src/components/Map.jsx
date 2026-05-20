import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../styles/Map.css'

// Fix for default Leaflet marker icons
// (Leaflet needs to know where the marker images are)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom hook to handle map clicks
// This is a Leaflet/React Leaflet feature that lets components listen to map events
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      // e.latlng contains the latitude and longitude where user clicked
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function Map({
  selectedLocation,
  startingPoint,
  routes,
  selectedRouteId,
  onMapClick,
  onResetLocation,
}) {
  // Default location: Sterling Heights, Michigan
  const defaultLocation = [42.8216, -83.0006]

  // Determine which location to show on map
  // Priority: startingPoint (confirmed) > selectedLocation (temporary) > default
  const displayLocation = startingPoint || selectedLocation || defaultLocation

  // Create icons for different marker types
  // Blue icon for selected but not confirmed location
  const selectedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })

  // Green icon for confirmed starting point
  const confirmedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })

  // Orange icon for destination points
  const destinationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })

  return (
    <div className="map-container">
      {/* MapContainer creates the map div and initializes Leaflet */}
      {/* zoom: 13 is a good starting zoom level for a city */}
      {/* center: [lat, lng] - the point where the map starts */}
      <MapContainer
        center={defaultLocation}
        zoom={13}
        scrollWheelZoom={true}
      >
        {/* TileLayer loads map tiles from OpenStreetMap */}
        {/* These tiles show the streets, buildings, and geography */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* MapClickHandler listens for clicks on the map */}
        {/* When user clicks, it calls onMapClick with the coordinates */}
        <MapClickHandler onMapClick={onMapClick} />

        {/* Draw route lines for each generated route */}
        {/* Each route is a round trip: start → destination → start */}
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.id
          const isBest = route.isBest
          let lineColor = '#4CAF50'
          if (isBest) {
            lineColor = '#FF9800'
          }
          if (isSelected) {
            lineColor = '#FF0000'
          }
          const lineWeight = isSelected || isBest ? 4 : 2

          return (
            <Polyline
              key={`route-${route.id}`}
              positions={route.path}
              color={lineColor}
              weight={lineWeight}
              opacity={isSelected || isBest ? 0.8 : 0.4}
            />
          )
        })}

        {/* Show destination markers for each route */}
        {routes.map((route) => (
          <Marker
            key={`dest-${route.id}`}
            position={[route.destination.lat, route.destination.lng]}
            icon={destinationIcon}
          >
            <Popup>
              <div>
                <h3>Route {route.id} Destination</h3>
                <p>Latitude: {route.destination.lat.toFixed(4)}</p>
                <p>Longitude: {route.destination.lng.toFixed(4)}</p>
                <p>Round trip distance: {route.distance} miles</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Show confirmed starting point marker if it exists */}
        {/* Green marker to show this is the official starting point */}
        {startingPoint && (
          <Marker position={[startingPoint.lat, startingPoint.lng]} icon={confirmedIcon}>
            <Popup>
              <div>
                <h3>✓ Starting Point</h3>
                <p>Latitude: {startingPoint.lat.toFixed(4)}</p>
                <p>Longitude: {startingPoint.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Show selected location marker if it exists (and is different from starting point) */}
        {/* Blue marker to show this is a temporary selection */}
        {selectedLocation && !startingPoint && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={selectedIcon}>
            <Popup>
              <div>
                <h3>Selected Location</h3>
                <p>Latitude: {selectedLocation.lat.toFixed(4)}</p>
                <p>Longitude: {selectedLocation.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Show both markers if both exist (selected different from starting point) */}
        {selectedLocation && startingPoint && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={selectedIcon}>
            <Popup>
              <div>
                <h3>New Selection</h3>
                <p>Latitude: {selectedLocation.lat.toFixed(4)}</p>
                <p>Longitude: {selectedLocation.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}

export default Map
