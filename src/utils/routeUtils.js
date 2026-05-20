// routeUtils.js - Utility functions for generating and calculating routes

export const ROUTE_COLORS = ['#2E7D32', '#1565C0', '#AD1457', '#6A1B9A', '#EF6C00']

/**
 * Convert miles to latitude degrees.
 * 1 degree of latitude is about 69 miles.
 */
function milesToLatitudeDegrees(miles) {
  return miles / 69
}

/**
 * Convert miles to longitude degrees.
 * Longitude lines get closer together farther north/south, so we adjust by latitude.
 */
function milesToLongitudeDegrees(miles, latitude) {
  const latitudeRadians = (latitude * Math.PI) / 180
  const milesPerLongitudeDegree = 69 * Math.cos(latitudeRadians)

  // Keep the math safe if the user ever picks a point very close to a pole.
  return miles / Math.max(milesPerLongitudeDegree, 1)
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180
}

function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360
}

function angularDistance(angleA, angleB) {
  const difference = Math.abs(normalizeAngle(angleA) - normalizeAngle(angleB))
  return Math.min(difference, 360 - difference)
}

function nudgeAwayFromStraightCompassLines(angle) {
  const straightCompassLines = [0, 90, 180, 270]

  for (const compassAngle of straightCompassLines) {
    if (angularDistance(angle, compassAngle) < 8) {
      const clockwiseDifference = normalizeAngle(angle - compassAngle)
      const nudgeDirection = clockwiseDifference < 180 ? 1 : -1
      return normalizeAngle(compassAngle + nudgeDirection * 12)
    }
  }

  return normalizeAngle(angle)
}

function clampNumber(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum)
}

function shuffleArray(items) {
  const shuffled = [...items]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1))
    const currentItem = shuffled[i]
    shuffled[i] = shuffled[randomIndex]
    shuffled[randomIndex] = currentItem
  }

  return shuffled
}

function createSpreadDistances(radiusMiles, count) {
  const minimumPercent = 0.58
  const maximumPercent = 0.94
  const distanceStep = count > 1 ? (maximumPercent - minimumPercent) / (count - 1) : 0

  const distances = Array.from({ length: count }, (_, index) => {
    const basePercent = minimumPercent + distanceStep * index
    const smallJitter = (Math.random() - 0.5) * 0.08
    const distancePercent = clampNumber(basePercent + smallJitter, minimumPercent, maximumPercent)
    return radiusMiles * distancePercent
  })

  // Shuffling keeps the destinations from looking like a perfect spiral.
  return shuffleArray(distances)
}

/**
 * Generate destination points within a radius of the starting point.
 * 
 * Parameters:
 *   startingPoint: { lat, lng } - the center point
 *   radiusMiles: number - the radius in miles (e.g., 20)
 *   count: number - how many destination points to generate (e.g., 4)
 * 
 * Returns: array of { lat, lng, distance } objects
 */
export function generateDestinationPoints(startingPoint, radiusMiles, count = 4) {
  if (!startingPoint) {
    return []
  }

  const safeCount = Math.max(1, count)
  const safeRadiusMiles = Math.max(Number(radiusMiles) || 20, 1)
  const destinations = []
  const angleStep = 360 / safeCount
  const randomRotation = Math.random() * angleStep
  const spreadDistances = createSpreadDistances(safeRadiusMiles, safeCount)

  // Each destination gets its own slice of the circle.
  // That gives a natural spread and avoids several points landing in one cluster.
  for (let i = 0; i < safeCount; i++) {
    const jitter = (Math.random() - 0.5) * angleStep * 0.35
    const angle = nudgeAwayFromStraightCompassLines(randomRotation + angleStep * i + jitter)
    const angleRadians = degreesToRadians(angle)
    const distanceMiles = spreadDistances[i]

    // Break the distance into north/south and east/west pieces.
    const northSouthMiles = distanceMiles * Math.cos(angleRadians)
    const eastWestMiles = distanceMiles * Math.sin(angleRadians)

    const newLat = startingPoint.lat + milesToLatitudeDegrees(northSouthMiles)
    const newLng = startingPoint.lng + milesToLongitudeDegrees(eastWestMiles, startingPoint.lat)

    destinations.push({
      lat: newLat,
      lng: newLng,
      distance: Math.round(distanceMiles * 10) / 10,
      angle: Math.round(angle),
    })
  }

  return destinations
}

function pointToObject(point) {
  if (Array.isArray(point)) {
    return { lat: point[0], lng: point[1] }
  }

  return point
}

function distanceBetweenPointsMiles(firstPoint, secondPoint) {
  const first = pointToObject(firstPoint)
  const second = pointToObject(secondPoint)

  const averageLatitude = (first.lat + second.lat) / 2
  const latitudeMiles = (first.lat - second.lat) * 69
  const longitudeMiles =
    (first.lng - second.lng) * 69 * Math.cos(degreesToRadians(averageLatitude))

  return Math.sqrt(latitudeMiles * latitudeMiles + longitudeMiles * longitudeMiles)
}

function metersToMiles(meters) {
  return Math.round((meters / 1609.34) * 10) / 10
}

function secondsToMinutes(seconds) {
  return Math.round((seconds / 60) * 10) / 10
}

export function createFallbackRoutePath(startingPoint, destination) {
  return [
    [startingPoint.lat, startingPoint.lng],
    [destination.lat, destination.lng],
    [startingPoint.lat, startingPoint.lng],
  ]
}

export function buildRouteFromTomTomResponse(apiResponse, startingPoint, destination, routeNumber) {
  const summary = apiResponse.summary || {}
  const distanceMeters = summary.lengthInMeters ?? 0
  const travelTimeSeconds = summary.travelTimeInSeconds ?? 0
  const trafficDelaySeconds = summary.trafficDelayInSeconds ?? 0
  const routeShape =
    Array.isArray(apiResponse.routeShape) && apiResponse.routeShape.length > 0
      ? apiResponse.routeShape
      : createFallbackRoutePath(startingPoint, destination)

  return {
    id: routeNumber,
    startingPoint,
    destination,
    path: routeShape,
    legPaths: Array.isArray(apiResponse.legShapes) ? apiResponse.legShapes : [],
    distanceMiles: metersToMiles(distanceMeters),
    distanceMeters,
    travelTimeSeconds,
    travelTimeMinutes: secondsToMinutes(travelTimeSeconds),
    trafficDelaySeconds,
  }
}

function sampleRoutePath(path, maximumSamples = 80) {
  if (!Array.isArray(path) || path.length === 0) {
    return []
  }

  const step = Math.max(1, Math.floor(path.length / maximumSamples))

  return path.filter((_, index) => {
    return index % step === 0 || index === path.length - 1
  })
}

function isNearRouteEndpoint(point, route) {
  const endpointSafeDistanceMiles = 0.35

  return (
    distanceBetweenPointsMiles(point, route.startingPoint) < endpointSafeDistanceMiles ||
    distanceBetweenPointsMiles(point, route.destination) < endpointSafeDistanceMiles
  )
}

function isPointNearAnyPath(point, path, closeEnoughMiles) {
  return path.some((pathPoint) => {
    return distanceBetweenPointsMiles(point, pathPoint) < closeEnoughMiles
  })
}

function calculateOverlapScore(route, allRoutes) {
  const closeEnoughMiles = 0.08
  const routeSample = sampleRoutePath(route.path)
  const otherRoutePoints = allRoutes
    .filter((otherRoute) => otherRoute.id !== route.id)
    .flatMap((otherRoute) => sampleRoutePath(otherRoute.path))

  if (routeSample.length === 0 || otherRoutePoints.length === 0) {
    return 0
  }

  let checkedPoints = 0
  let overlappingPoints = 0

  routeSample.forEach((point) => {
    // All routes share the same home area, so ignore the unavoidable overlap there.
    if (isNearRouteEndpoint(point, route)) {
      return
    }

    checkedPoints += 1

    if (isPointNearAnyPath(point, otherRoutePoints, closeEnoughMiles)) {
      overlappingPoints += 1
    }
  })

  return checkedPoints === 0 ? 0 : overlappingPoints / checkedPoints
}

function splitPathIntoTwoLegs(path) {
  if (!Array.isArray(path) || path.length < 4) {
    return [path || [], []]
  }

  const middleIndex = Math.floor(path.length / 2)
  return [path.slice(0, middleIndex), path.slice(middleIndex)]
}

function calculateRepetitionScore(route) {
  const closeEnoughMiles = 0.08
  const routeLegs =
    Array.isArray(route.legPaths) && route.legPaths.length >= 2
      ? route.legPaths
      : splitPathIntoTwoLegs(route.path)

  const outboundSample = sampleRoutePath(routeLegs[0])
  const returnSample = sampleRoutePath(routeLegs[1])

  if (outboundSample.length === 0 || returnSample.length === 0) {
    return 0
  }

  let checkedPoints = 0
  let repeatedPoints = 0

  outboundSample.forEach((point) => {
    // Ignore the start and destination, because every round trip must touch those.
    if (isNearRouteEndpoint(point, route)) {
      return
    }

    checkedPoints += 1

    if (isPointNearAnyPath(point, returnSample, closeEnoughMiles)) {
      repeatedPoints += 1
    }
  })

  return checkedPoints === 0 ? 0 : repeatedPoints / checkedPoints
}

/**
 * Add quality scores after TomTom returns real route shapes.
 * Lower score is better.
 */
export function addRouteQualityScores(routes) {
  if (!Array.isArray(routes) || routes.length === 0) {
    return []
  }

  const routesWithQuality = routes.map((route) => {
    const overlapScore = calculateOverlapScore(route, routes)
    const repetitionScore = calculateRepetitionScore(route)

    // These small pieces are easy to reason about:
    // time + distance + traffic delay + route overlap + repeated out/back roads.
    const timePart = route.travelTimeSeconds * 0.45
    const distancePart = route.distanceMeters * 0.006
    const trafficPart = route.trafficDelaySeconds * 0.6
    const overlapPart = overlapScore * 1800
    const repetitionPart = repetitionScore * 1400

    return {
      ...route,
      overlapScore,
      repetitionScore,
      score: Math.round(timePart + distancePart + trafficPart + overlapPart + repetitionPart),
    }
  })

  const routesNeedOffset = routesWithQuality.some((route) => route.overlapScore > 0.14)
  const centerOffset = (routesWithQuality.length - 1) / 2

  return routesWithQuality.map((route, index) => ({
    ...route,
    displayOffset: routesNeedOffset ? index - centerOffset : 0,
  }))
}
