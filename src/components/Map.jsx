import { Fragment, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet'
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

const DEFAULT_LOCATION = [42.8216, -83.0006]

function createMarkerIcon(colorName) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${colorName}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

const selectedIcon = createMarkerIcon('blue')
const confirmedIcon = createMarkerIcon('green')
const destinationIcon = createMarkerIcon('orange')

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

function RouteZoomHandler({ routes, selectedRouteId }) {
  const map = useMap()

  useEffect(() => {
    if (!selectedRouteId) {
      return
    }

    const selectedRoute = routes.find((route) => route.id === selectedRouteId)

    if (!selectedRoute || !Array.isArray(selectedRoute.path) || selectedRoute.path.length === 0) {
      return
    }

    // When a route card is clicked, zoom the map to show that whole route.
    const bounds = L.latLngBounds(selectedRoute.path)

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [36, 36],
        maxZoom: 13,
        animate: true,
      })
    }
  }, [map, routes, selectedRouteId])

  return null
}

function StartingPointFocusHandler({ startingPoint }) {
  const map = useMap()

  useEffect(() => {
    if (!startingPoint) {
      return
    }

    // When Google search sets a starting point, move Leaflet to that place.
    map.flyTo([startingPoint.lat, startingPoint.lng], 14, {
      animate: true,
      duration: 0.7,
    })
  }, [map, startingPoint])

  return null
}

function isCloseToPoint(pathPoint, mapPoint) {
  return (
    Math.abs(pathPoint[0] - mapPoint.lat) < 0.0002 &&
    Math.abs(pathPoint[1] - mapPoint.lng) < 0.0002
  )
}

function getDisplayPath(route) {
  if (!route.displayOffset) {
    return route.path
  }

  // The offset is tiny. It only helps nearby overlapping lines stay readable.
  const offsetSize = 0.00008 * route.displayOffset

  return route.path.map((point, index) => {
    const isFirstPoint = index === 0
    const isLastPoint = index === route.path.length - 1
    const isDestinationPoint = isCloseToPoint(point, route.destination)

    if (isFirstPoint || isLastPoint || isDestinationPoint) {
      return point
    }

    return [point[0] + offsetSize, point[1] - offsetSize]
  })
}

function getRouteLineOptions(route, isSelected, isHovered, isBestQuietRoute) {
  return {
    color: route.color || '#4CAF50',
    weight: isSelected ? 5 : isHovered ? 4.5 : isBestQuietRoute ? 3.6 : 3,
    opacity: isSelected ? 0.92 : isHovered ? 0.82 : isBestQuietRoute ? 0.7 : 0.58,
    lineCap: 'round',
    lineJoin: 'round',
  }
}

function getRouteHighlightOptions(route, isSelected) {
  return {
    color: route.color || '#4CAF50',
    weight: isSelected ? 10 : 6,
    opacity: isSelected ? 0.2 : 0.09,
    lineCap: 'round',
    lineJoin: 'round',
  }
}

function RouteLegend({ routes }) {
  if (routes.length === 0) {
    return null
  }

  return (
    <div className="route-legend">
      <h3>Route legend</h3>
      <div className="legend-items">
        {routes.map((route) => (
          <div key={`legend-${route.id}`} className="legend-item">
            <span className="legend-color" style={{ backgroundColor: route.color }} />
            <span>
              Route {route.id}
              {route.isBestQuietRoute ? ' (Best quiet route)' : ''}
            </span>
          </div>
        ))}
      </div>
      <div className="legend-note">Selected routes use a soft outline.</div>
    </div>
  )
}

function Map({
  selectedLocation,
  startingPoint,
  routes,
  selectedRouteId,
  bestQuietRouteId,
  hoveredRouteId,
  onRouteSelect,
  onMapClick,
}) {
  // Determine which location to show on map
  // Priority: startingPoint (confirmed) > selectedLocation (temporary) > default
  const displayLocation = startingPoint || selectedLocation || DEFAULT_LOCATION
  const mapCenter = Array.isArray(displayLocation)
    ? displayLocation
    : [displayLocation.lat, displayLocation.lng]
  const activeRouteId = hoveredRouteId || selectedRouteId
  const routesForDrawing = [...routes].sort((firstRoute, secondRoute) => {
    if (firstRoute.id === activeRouteId) {
      return 1
    }
    if (secondRoute.id === activeRouteId) {
      return -1
    }
    return 0
  })

  return (
    <div className="map-container">
      {/* MapContainer creates the map div and initializes Leaflet */}
      {/* zoom: 13 is a good starting zoom level for a city */}
      {/* center: [lat, lng] - the point where the map starts */}
      <MapContainer
        center={mapCenter}
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
        <StartingPointFocusHandler startingPoint={startingPoint} />
        <RouteZoomHandler routes={routes} selectedRouteId={selectedRouteId} />

        {/* Draw route lines for each generated route */}
        {/* Each route is a round trip: start → destination → start */}
        {routesForDrawing.map((route) => {
          const isSelected = selectedRouteId === route.id
          const isBestQuietRoute = bestQuietRouteId === route.id
          const isHovered = hoveredRouteId === route.id
          const isActive = isSelected || isHovered
          const displayPath = getDisplayPath(route)
          const lineOptions = getRouteLineOptions(route, isSelected, isHovered, isBestQuietRoute)
          // Clicking a route line selects that route, just like clicking its card.
          const routeClickHandlers = {
            click() {
              onRouteSelect(route.id)
            },
          }

          return (
            <Fragment key={`route-wrapper-${route.id}`}>
              {isActive && (
                <Polyline
                  key={`route-soft-highlight-${route.id}`}
                  positions={displayPath}
                  pathOptions={getRouteHighlightOptions(route, isSelected)}
                  eventHandlers={routeClickHandlers}
                  smoothFactor={1.3}
                />
              )}
              <Polyline
                key={`route-${route.id}`}
                positions={displayPath}
                pathOptions={lineOptions}
                eventHandlers={routeClickHandlers}
                smoothFactor={1.3}
              />
            </Fragment>
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
                <p>Round trip distance: {route.distanceMiles} miles</p>
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
                <h3>Starting Point</h3>
                {startingPoint.placeName && <p>{startingPoint.placeName}</p>}
                {startingPoint.address && <p>{startingPoint.address}</p>}
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
      <RouteLegend
        routes={routes.map((route) => ({
          ...route,
          isBestQuietRoute: bestQuietRouteId === route.id,
        }))}
      />
    </div>
  )
}

export default Map
