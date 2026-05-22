import { useCallback, useState } from 'react'
import Map from './components/Map'
import InfoPanel from './components/InfoPanel'
import RouteGenerator from './components/RouteGenerator'
import RouteList from './components/RouteList'
import {
  ROUTE_COLORS,
  addRouteQualityScores,
  buildRouteFromTomTomResponse,
  generateDestinationPoints,
  getPreferredMinimumTravelSeconds,
  sortRoutesByDriveTimeFit,
} from './utils/routeUtils'
import { fetchTomTomRoute } from './utils/tomtomApi'
import './App.css'

const ROUTE_COUNT = 3
const MAX_ROUTE_ATTEMPTS = 24
const CANDIDATE_BATCH_SIZE = 4

function App() {
  // selectedStartingPoint is the latest point chosen from search or map click.
  const [selectedStartingPoint, setSelectedStartingPoint] = useState(null)

  // confirmedStartingPoint is the point TomTom uses for every round trip.
  const [confirmedStartingPoint, setConfirmedStartingPoint] = useState(null)

  // State to store the generated routes
  const [routes, setRoutes] = useState([])

  // selectedRouteId is the route the user clicked.
  // bestQuietRouteId is the route the app recommends.
  const [selectedRouteId, setSelectedRouteId] = useState(null)
  const [bestQuietRouteId, setBestQuietRouteId] = useState(null)
  const [hoveredRouteId, setHoveredRouteId] = useState(null)

  // State to track if we are loading routes from TomTom
  const [isGenerating, setIsGenerating] = useState(false)

  // State to show any error messages from route generation
  const [routeError, setRouteError] = useState(null)
  const [routeNotice, setRouteNotice] = useState(null)

  // Called when user clicks on the map
  const handleMapClick = (lat, lng) => {
    const clickedStartingPoint = { lat, lng }

    setSelectedStartingPoint(clickedStartingPoint)
    setConfirmedStartingPoint(clickedStartingPoint)
    setRoutes([])
    setRouteError(null)
    setRouteNotice(null)
    setSelectedRouteId(null)
    setBestQuietRouteId(null)
    setHoveredRouteId(null)
  }

  // Address/place search sets the starting point right away.
  const handlePlaceSelect = useCallback((placeLocation) => {
    setSelectedStartingPoint(placeLocation)
    setConfirmedStartingPoint(placeLocation)
    setRoutes([])
    setRouteError(null)
    setRouteNotice(null)
    setSelectedRouteId(null)
    setBestQuietRouteId(null)
    setHoveredRouteId(null)
  }, [])

  // Reset all location and route state
  const handleResetLocation = () => {
    setSelectedStartingPoint(null)
    setConfirmedStartingPoint(null)
    setRoutes([])
    setSelectedRouteId(null)
    setBestQuietRouteId(null)
    setHoveredRouteId(null)
    setRouteError(null)
    setRouteNotice(null)
  }

  // Generate up to three real round-trip routes within the selected time limit.
  const handleGenerateRoutes = async (startingPointLocation, radiusMiles, routeOptions = {}) => {
    if (!startingPointLocation) {
      setRouteError('Please search or click a starting point first.')
      setRouteNotice(null)
      return
    }

    setIsGenerating(true)
    setRouteError(null)
    setRouteNotice(null)
    setSelectedRouteId(null)
    setBestQuietRouteId(null)
    setHoveredRouteId(null)
    setRoutes([])

    const maxDriveTimeMinutes = Number(routeOptions.driveTimeMinutes) || 30
    const maxDriveTimeSeconds = maxDriveTimeMinutes * 60
    const candidateDestinations = generateDestinationPoints(
      startingPointLocation,
      radiusMiles,
      MAX_ROUTE_ATTEMPTS,
      maxDriveTimeMinutes
    )
    const validRoutes = []
    let failedRouteCount = 0
    let overTimeLimitCount = 0

    try {
      for (
        let batchStart = 0;
        batchStart < candidateDestinations.length;
        batchStart += CANDIDATE_BATCH_SIZE
      ) {
        const destinationBatch = candidateDestinations.slice(
          batchStart,
          batchStart + CANDIDATE_BATCH_SIZE
        )

        // Check a few TomTom routes at a time so retrying more candidates does not feel too slow.
        const routeResults = await Promise.all(
          destinationBatch.map((destination) => requestRoundTripRoute(
            startingPointLocation,
            destination,
            routeOptions
          ))
        )

        for (const result of routeResults) {
          if (!result.ok) {
            failedRouteCount += 1
            continue
          }

          // TomTom returns one summary for the whole start → destination → start trip.
          if (result.route.travelTimeSeconds > maxDriveTimeSeconds) {
            overTimeLimitCount += 1
            continue
          }

          validRoutes.push(result.route)
        }
      }

      if (validRoutes.length === 0) {
        throw new Error(
          `No round-trip routes found within ${maxDriveTimeMinutes} minutes. Try a higher time limit, smaller radius, or turn off Avoid highways or Prefer local roads.`
        )
      }

      const routeCandidates = sortRoutesByDriveTimeFit(validRoutes, maxDriveTimeMinutes).map((route, index) => ({
        ...route,
        id: index + 1,
      }))
      const scoredCandidateRoutes = addRouteQualityScores(routeCandidates)
      const bestScoredCandidates = [...scoredCandidateRoutes]
        .sort((firstRoute, secondRoute) => {
          if (firstRoute.score !== secondRoute.score) {
            return firstRoute.score - secondRoute.score
          }

          return firstRoute.trafficDelaySeconds - secondRoute.trafficDelaySeconds
        })
        .slice(0, ROUTE_COUNT)
      const routesForDisplay = bestScoredCandidates.map((route, index) => ({
        ...route,
        id: index + 1,
      }))
      const scoredRoutes = addRouteQualityScores(routesForDisplay)

      const bestRoute = scoredRoutes.reduce((currentBest, route) => {
        return route.score < currentBest.score ? route : currentBest
      }, scoredRoutes[0])

      const newRoutes = scoredRoutes.map((route, index) => ({
        ...route,
        color: ROUTE_COLORS[index % ROUTE_COLORS.length],
      }))

      setRoutes(newRoutes)
      setBestQuietRouteId(bestRoute.id)
      // Leave selectedRouteId empty so the recommendation does not block the user's choice.
      setSelectedRouteId(null)
      setRouteNotice(
        buildRouteNotice({
          shownRouteCount: newRoutes.length,
          failedRouteCount,
          overTimeLimitCount,
          maxDriveTimeMinutes,
          foundOnlyShorterRoutes: foundOnlyShorterRoutes(
            newRoutes,
            maxDriveTimeMinutes
          ),
        })
      )
    } catch (error) {
      setRouteError(
        error?.message || 'Unable to generate routes from TomTom. Please try again.'
      )
      setRouteNotice(null)
      setRoutes([])
      setSelectedRouteId(null)
      setBestQuietRouteId(null)
      setHoveredRouteId(null)
    } finally {
      setIsGenerating(false)
    }
  }

  async function requestRoundTripRoute(startingPointLocation, destination, routeOptions) {
    const apiResponse = await fetchTomTomRoute(
      [
        startingPointLocation,
        destination,
        startingPointLocation,
      ],
      routeOptions
    )

    if (!apiResponse.ok) {
      return { ok: false }
    }

    return {
      ok: true,
      route: buildRouteFromTomTomResponse(
        apiResponse,
        startingPointLocation,
        destination,
        0,
        routeOptions
      ),
    }
  }

  function foundOnlyShorterRoutes(routesToShow, maxDriveTimeMinutes) {
    const preferredMinimumSeconds = getPreferredMinimumTravelSeconds(maxDriveTimeMinutes)

    return routesToShow.every((route) => route.travelTimeSeconds < preferredMinimumSeconds)
  }

  function buildRouteNotice({
    shownRouteCount,
    failedRouteCount,
    overTimeLimitCount,
    maxDriveTimeMinutes,
    foundOnlyShorterRoutes,
  }) {
    const noticeParts = []

    if (foundOnlyShorterRoutes) {
      noticeParts.push(
        `We found shorter routes under your ${maxDriveTimeMinutes}-minute limit.`
      )
    }

    if (shownRouteCount < ROUTE_COUNT) {
      noticeParts.push(
        `Could not find ${ROUTE_COUNT} routes within ${maxDriveTimeMinutes} minutes. Found ${shownRouteCount}. Try a higher time limit, smaller radius, or turn off Avoid highways or Prefer local roads.`
      )
    }

    if (overTimeLimitCount > 0) {
      noticeParts.push(
        `${overTimeLimitCount} route option${overTimeLimitCount === 1 ? '' : 's'} over ${maxDriveTimeMinutes} minutes were skipped.`
      )
    }

    if (failedRouteCount > 0) {
      noticeParts.push(
        `${failedRouteCount} route option${failedRouteCount === 1 ? '' : 's'} could not be generated.`
      )
    }

    return noticeParts.length > 0
      ? noticeParts.join(' ')
      : null
  }

  // Clear the currently generated routes but keep the starting point
  const handleClearRoutes = () => {
    setRoutes([])
    setSelectedRouteId(null)
    setBestQuietRouteId(null)
    setHoveredRouteId(null)
    setRouteError(null)
    setRouteNotice(null)
  }

  const handleRouteSelect = (routeId) => {
    setSelectedRouteId(routeId)
  }

  const handleRouteHover = (routeId) => {
    setHoveredRouteId(routeId)
  }

  // Regenerate routes using the current radius and starting point
  const handleRegenerateRoutes = (radiusMiles, routeOptions = {}) => {
    if (confirmedStartingPoint) {
      handleGenerateRoutes(confirmedStartingPoint, radiusMiles, routeOptions)
    }
  }

  return (
    <div className="app-container">
      <Map
        selectedStartingPoint={selectedStartingPoint}
        confirmedStartingPoint={confirmedStartingPoint}
        routes={routes}
        selectedRouteId={selectedRouteId}
        bestQuietRouteId={bestQuietRouteId}
        hoveredRouteId={hoveredRouteId}
        onRouteSelect={handleRouteSelect}
        onMapClick={handleMapClick}
      />
      <div className="right-panels">
        <InfoPanel
          selectedStartingPoint={selectedStartingPoint}
          confirmedStartingPoint={confirmedStartingPoint}
          onPlaceSelect={handlePlaceSelect}
          onResetLocation={handleResetLocation}
        />
        <RouteGenerator
          startingPoint={confirmedStartingPoint}
          onGenerateRoutes={handleGenerateRoutes}
          onClearRoutes={handleClearRoutes}
          onRegenerateRoutes={handleRegenerateRoutes}
          onResetStartingPoint={handleResetLocation}
          isGenerating={isGenerating}
          errorMessage={routeError}
          noticeMessage={routeNotice}
          hasRoutes={routes.length > 0}
        />
        <RouteList
          routes={routes}
          onRouteHover={handleRouteHover}
          onRouteSelect={handleRouteSelect}
          selectedRouteId={selectedRouteId}
          bestQuietRouteId={bestQuietRouteId}
        />
      </div>
    </div>
  )
}

export default App
