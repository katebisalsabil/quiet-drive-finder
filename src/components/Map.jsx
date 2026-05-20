import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
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

function Map() {
  // Starting location: Sterling Heights, Michigan
  // Latitude and Longitude for the center of the map
  const startingLocation = [42.8216, -83.0006]
  
  return (
    <div className="map-container">
      {/* MapContainer creates the map div and initializes Leaflet */}
      {/* zoom: 13 is a good starting zoom level for a city */}
      {/* center: [lat, lng] - the point where the map starts */}
      <MapContainer
        center={startingLocation}
        zoom={13}
        scrollWheelZoom={true}
      >
        {/* TileLayer loads map tiles from OpenStreetMap */}
        {/* These tiles show the streets, buildings, and geography */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker: A pin on the map */}
        {/* position: [lat, lng] - where the marker appears */}
        <Marker position={startingLocation}>
          {/* Popup: Text that shows when you click the marker */}
          <Popup>
            <div>
              <h3>Starting area</h3>
              <p>Sterling Heights, Michigan</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

export default Map
