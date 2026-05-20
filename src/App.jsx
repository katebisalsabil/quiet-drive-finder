import { useState } from 'react'
import Map from './components/Map'
import InfoPanel from './components/InfoPanel'
import RouteGenerator from './components/RouteGenerator'
import RouteList from './components/RouteList'
import {
  ROUTE_COLORS,
  addRouteQualityScores,
  buildRouteFromTomTomResponse,
  generateDestinationPoints,
} from './utils/routeUtils'
import { fetchTomTomRoute } from './utils/tomtomApi'
import './App.css'

const ROUTE_COUNT = 3

function App() {
  // State to store the currently selected location (where user clicked)
  const [selectedLocation, setSelectedLocation] = useState(null)

  // State to store the confirmed starting point
  const [startingPoint, setStartingPoint] = useState(null)

  // State to store the generated routes
  const [routes, setRoutes] = useState([])

  // State to track the route selected by click or hover
  const [selectedRouteId, setSelectedRouteId] = useState(null)
  const [hoveredRouteId, setHoveredRouteId] = useState(null)

  // State to track if we are loading routes from TomTom
  const [isGenerating, setIsGenerating] = useState(false)

  // State to show any error messages from route generation
  const [routeError, setRouteError] = useState(null)

  // Called when user clicks on the map
  const handleMapClick = (lat, lng) => {
    setSelectedLocation({ lat, lng })
    setRouteError(null)
  }

  // Confirm the selected location as the starting point
  const handleConfirmStartingPoint = () => {
    if (selectedLocation) {
      setStartingPoint(selectedLocation)
      setSelectedLocation(null)
      setRoutes([])
      setRouteError(null)
      setSelectedRouteId(null)
      setHoveredRouteId(null)
    }
  }

  // Reset all location and route state
  const handleResetLocation = () => {
    setSelectedLocation(null)
    setStartingPoint(null)
    setRoutes([])
    setSelectedRouteId(null)
    setHoveredRouteId(null)
    setRouteError(null)
  }

  // Generate three real routes using TomTom from start → destination → start
  const handleGenerateRoutes = async (startingPointLocation, radiusMiles) => {
    if (!startingPointLocation) {
      setRouteError('Please confirm a starting point before generating routes.')
      return
    }

    setIsGenerating(true)
    setRouteError(null)
    setSelectedRouteId(null)
    setHoveredRouteId(null)
    setRoutes([])

    const destinations = generateDestinationPoints(startingPointLocation, radiusMiles, ROUTE_COUNT)

    try {
      const routePromises = destinations.map(async (destination, index) => {
        const apiResponse = await fetchTomTomRoute([
          startingPointLocation,
          destination,
          startingPointLocation,
        ])

        if (!apiResponse.ok) {
          throw new Error(apiResponse.message || 'TomTom could not calculate one route option.')
        }

        return buildRouteFromTomTomResponse(
          apiResponse,
          startingPointLocation,
          destination,
          index + 1
        )
      })

      const settledRouteResults = await Promise.allSettled(routePromises)
      const routeResults = settledRouteResults
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value)
      const failedRouteCount = settledRouteResults.length - routeResults.length

      if (routeResults.length === 0) {
        throw new Error('No routes could be generated. Try a different radius or starting point.')
      }

      const scoredRoutes = addRouteQualityScores(routeResults)

      const bestRoute = scoredRoutes.reduce((currentBest, route) => {
        return route.score < currentBest.score ? route : currentBest
      }, scoredRoutes[0])

      const newRoutes = scoredRoutes.map((route, index) => ({
        ...route,
        isBest: route.id === bestRoute.id,
        color: ROUTE_COLORS[index % ROUTE_COLORS.length],
      }))

      setRoutes(newRoutes)
      setSelectedRouteId(bestRoute.id)
      setRouteError(
        failedRouteCount > 0
          ? `Generated ${routeResults.length} route option${routeResults.length === 1 ? '' : 's'}. ${failedRouteCount} option${failedRouteCount === 1 ? '' : 's'} could not be generated.`
          : null
      )
    } catch (error) {
      setRouteError(
        error?.message || 'Unable to generate routes from TomTom. Please try again.'
      )
      setRoutes([])
      setSelectedRouteId(null)
      setHoveredRouteId(null)
    } finally {
      setIsGenerating(false)
    }
  }

  // Clear the currently generated routes but keep the starting point
  const handleClearRoutes = () => {
    setRoutes([])
    setSelectedRouteId(null)
    setHoveredRouteId(null)
    setRouteError(null)
  }

  const handleRouteSelect = (routeId) => {
    setSelectedRouteId(routeId)
  }

  const handleRouteHover = (routeId) => {
    setHoveredRouteId(routeId)
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
        hoveredRouteId={hoveredRouteId}
        onMapClick={handleMapClick}
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
          hasRoutes={routes.length > 0}
        />
        <RouteList
          routes={routes}
          onRouteHover={handleRouteHover}
          onRouteSelect={handleRouteSelect}
          selectedRouteId={selectedRouteId}
        />
      </div>
    </div>
  )
}

export default App
