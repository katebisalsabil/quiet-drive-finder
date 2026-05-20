import { useState } from 'react'
import Map from './components/Map'
import InfoPanel from './components/InfoPanel'
import './App.css'

function App() {
  // State to store the currently selected location (where user clicked)
  // Starts as null until user clicks on the map
  const [selectedLocation, setSelectedLocation] = useState(null)

  // State to store the confirmed starting point
  // This is the location the user said "Use this as my starting point" for
  const [startingPoint, setStartingPoint] = useState(null)

  // Called when user clicks on the map
  // e.latlng contains the latitude and longitude the user clicked
  const handleMapClick = (lat, lng) => {
    setSelectedLocation({ lat, lng })
  }

  // Called when user clicks "Use this as my starting point"
  // Confirms the selected location as the official starting point
  const handleConfirmStartingPoint = () => {
    if (selectedLocation) {
      setStartingPoint(selectedLocation)
    }
  }

  // Called when user clicks "Reset starting point"
  // Clears both the selected location and confirmed starting point
  const handleResetLocation = () => {
    setSelectedLocation(null)
    setStartingPoint(null)
  }

  return (
    <div className="app-container">
      <Map
        selectedLocation={selectedLocation}
        startingPoint={startingPoint}
        onMapClick={handleMapClick}
        onResetLocation={handleResetLocation}
      />
      <InfoPanel
        selectedLocation={selectedLocation}
        startingPoint={startingPoint}
        onConfirmStartingPoint={handleConfirmStartingPoint}
        onResetLocation={handleResetLocation}
      />
    </div>
  )
}

export default App
