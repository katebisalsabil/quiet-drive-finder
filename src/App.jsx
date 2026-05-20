import { useState } from 'react'
import Map from './components/Map'
import InfoPanel from './components/InfoPanel'
import RouteGenerator from './components/RouteGenerator'
import RouteList from './components/RouteList'
import { generateDestinationPoints } from './utils/routeUtils'
import { fetchTomTomRoute } from './utils/tomtomApi'
import './App.css'

function App() {
  // State to store the currently selected location (where user clicked)
  const [selectedLocation, setSelectedLocation] = useState(null)

  // State to store the confirmed starting point
  const [startingPoint, setStartingPoint] = useState(null)

  // State to store the generated routes
  const [routes, setRoutes] = useState([])

  // State to track which route is being hovered over
  const [selectedRouteId, setSelectedRouteId] = useState(null)

  // State to track if we are loading routes from TomTom
  const [isGenerating, setIsGenerating] = useState(false)

  // State to show any error messages from route generation
  const [routeError, setRouteError] = useState(null)

  // Called when user clicks on the map
  const handleMapClick = (lat, lng) => {
    setSelectedLocation({ lat, lng })
  }

  // Confirm the selected location as the starting point
  const handleConfirmStartingPoint = () => {
    if (selectedLocation) {
      setStartingPoint(selectedLocation)
      setRoutes([])
      setRouteError(null)
      setSelectedRouteId(null)
    }
  }

  // Reset all location and route state
  const handleResetLocation = () => {
    setSelectedLocation(null)
    setStartingPoint(null)
    setRoutes([])
    setSelectedRouteId(null)
    setRouteError(null)
  }

  // Generate three real routes using TomTom from start → destination → start
  const handleGenerateRoutes = async (startingPointLocation, radiusMiles) => {
    if (!startingPointLocation) {
      return
    }

    setIsGenerating(true)
    setRouteError(null)
    setSelectedRouteId(null)
    setRoutes([])

    const destinations = generateDestinationPoints(startingPointLocation, radiusMiles, 3)

    try {
      const routePromises = destinations.map(async (destination, index) => {
        const apiResponse = await fetchTomTomRoute([
          startingPointLocation,
          destination,
          startingPointLocation,
        ])

        if (!apiResponse.ok) {
          throw new Error(
            `TomTom route request failed with status ${apiResponse.status}.`
          )
        }

        const summary = apiResponse.summary || {}
        const distanceMeters = summary.lengthInMeters ?? 0
        const travelTimeSeconds = summary.travelTimeInSeconds ?? 0
        const trafficDelaySeconds = summary.trafficDelayInSeconds ?? 0
        const routeShape = apiResponse.routeShape.length
          ? apiResponse.routeShape
          : [
              [startingPointLocation.lat, startingPointLocation.lng],
              [destination.lat, destination.lng],
              [startingPointLocation.lat, startingPointLocation.lng],
            ]

        const distanceMiles = Math.round((distanceMeters / 1609.34) * 10) / 10
        const travelTimeMinutes = Math.round((travelTimeSeconds / 60) * 10) / 10
        const score = trafficDelaySeconds + travelTimeSeconds * 0.5 + distanceMeters * 0.01

        return {
          id: index + 1,
          startingPoint: startingPointLocation,
          destination,
          path: routeShape,
          distanceMiles,
          distanceMeters,
          travelTimeSeconds,
          travelTimeMinutes,
          trafficDelaySeconds,
          score,
        }
      })

      const routeResults = await Promise.all(routePromises)

      const bestRoute = routeResults.reduce((currentBest, route) => {
        return route.score < currentBest.score ? route : currentBest
      }, routeResults[0])

      const newRoutes = routeResults.map((route) => ({
        ...route,
        isBest: route.id === bestRoute.id,
      }))

      setRoutes(newRoutes)
    } catch (error) {
      console.error('TomTom route generation failed:', error)
      setRouteError(
        error?.message || 'Unable to generate routes from TomTom. Please try again.'
      )
      setRoutes([])
    } finally {
      setIsGenerating(false)
    }
  }

  // Clear the currently generated routes but keep the starting point
  const handleClearRoutes = () => {
    setRoutes([])
    setSelectedRouteId(null)
    setRouteError(null)
  }

  // Regenerate routes using the current radius and starting point
  const handleRegenerateRoutes = (radiusMiles) => {
    if (startingPoint) {
      handleGenerateRoutes(startingPoint, radiusMiles)
    }
  }

  return (
    <div className="app-container">
      <Map
        selectedLocation={selectedLocation}
        startingPoint={startingPoint}
        routes={routes}
        selectedRouteId={selectedRouteId}
        onMapClick={handleMapClick}
        onResetLocation={handleResetLocation}
      />
      <div className="right-panels">
        <InfoPanel
          selectedLocation={selectedLocation}
          startingPoint={startingPoint}
          onConfirmStartingPoint={handleConfirmStartingPoint}
          onResetLocation={handleResetLocation}
        />
        <RouteGenerator
          startingPoint={startingPoint}
          onGenerateRoutes={handleGenerateRoutes}
          onClearRoutes={handleClearRoutes}
          onRegenerateRoutes={handleRegenerateRoutes}
          onResetStartingPoint={handleResetLocation}
          isGenerating={isGenerating}
          errorMessage={routeError}
        />
        <RouteList
          routes={routes}
          onRouteHover={setSelectedRouteId}
          selectedRouteId={selectedRouteId}
        />
      </div>
    </div>
  )
}

export default App
