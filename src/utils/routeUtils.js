// routeUtils.js - Utility functions for generating and calculating routes

export const ROUTE_COLORS = ['#2E7D32', '#1565C0', '#AD1457', '#6A1B9A', '#EF6C00']

const HIGHWAY_WORDS = [
  /\binterstate\b/i,
  /\bfreeway\b/i,
  /\bexpressway\b/i,
  /\bmotorway\b/i,
  /\bturnpike\b/i,
  /\bhighway\b/i,
  /\bhwy\b/i,
  /\bI[-\s]?\d+\b/i,
  /\bUS[-\s]?\d+\b/i,
  /\bU\.S\.\s?\d+\b/i,
  /\bSR[-\s]?\d+\b/i,
  /\broute\s+\d+\b/i,
]

const TURN_WORDS = [
  /\bturn\b/i,
  /\bleft\b/i,
  /\bright\b/i,
  /\broundabout\b/i,
  /\bu-turn\b/i,
  /\bexit\b/i,
  /\bramp\b/i,
]

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

function joinInstructionText(instruction) {
  if (!instruction) {
    return ''
  }

  return [
    instruction.message,
    instruction.maneuver,
    instruction.street,
    instruction.signpostText,
    ...(Array.isArray(instruction.roadNumbers) ? instruction.roadNumbers : []),
  ]
    .filter(Boolean)
    .join(' ')
}

function textMatchesAnyPattern(text, patterns) {
  return patterns.some((pattern) => pattern.test(text))
}

function countHighwayInstructions(instructions) {
  return instructions.filter((instruction) => {
    return textMatchesAnyPattern(joinInstructionText(instruction), HIGHWAY_WORDS)
  }).length
}

function countTurnInstructions(instructions) {
  return instructions.filter((instruction) => {
    return textMatchesAnyPattern(joinInstructionText(instruction), TURN_WORDS)
  }).length
}

function getPointHeading(firstPoint, secondPoint) {
  const latDifference = secondPoint[0] - firstPoint[0]
  const lngDifference = secondPoint[1] - firstPoint[1]

  return Math.atan2(lngDifference, latDifference)
}

function radiansToDegrees(radians) {
  return (radians * 180) / Math.PI
}

function estimateTurnCountFromPath(path) {
  if (!Array.isArray(path) || path.length < 3) {
    return 0
  }

  let turnCount = 0

  for (let index = 1; index < path.length - 1; index++) {
    const previousHeading = getPointHeading(path[index - 1], path[index])
    const nextHeading = getPointHeading(path[index], path[index + 1])
    const headingChange = Math.abs(radiansToDegrees(nextHeading - previousHeading))
    const normalizedChange = Math.min(headingChange, 360 - headingChange)

    // Small bends are normal. Bigger direction changes usually feel like turns.
    if (normalizedChange > 50) {
      turnCount += 1
    }
  }

  return turnCount
}

function buildTomTomSignalSummary(instructions, path) {
  const safeInstructions = Array.isArray(instructions) ? instructions : []
  const instructionCount = safeInstructions.length
  const highwayInstructionCount = countHighwayInstructions(safeInstructions)
  const turnInstructionCount = countTurnInstructions(safeInstructions)
  const estimatedTurnCount = estimateTurnCountFromPath(path)
  const turnCount = Math.max(turnInstructionCount, estimatedTurnCount)
  const highwayRatio = instructionCount === 0 ? 0 : highwayInstructionCount / instructionCount
  const localRoadRatio = instructionCount === 0 ? 0 : 1 - highwayRatio

  return {
    instructionCount,
    highwayInstructionCount,
    turnCount,
    highwayRatio,
    localRoadRatio,
  }
}

export function getPreferredMinimumTravelSeconds(driveTimeMinutes) {
  const safeDriveTimeMinutes = Number(driveTimeMinutes) || 30
  const maxTravelSeconds = safeDriveTimeMinutes * 60
  const preferredPercent = safeDriveTimeMinutes <= 20 ? 0.75 : 0.8

  return maxTravelSeconds * preferredPercent
}

function getTimeFitDistance(route, driveTimeMinutes) {
  const safeDriveTimeMinutes = Number(driveTimeMinutes) || 30
  const maxTravelSeconds = safeDriveTimeMinutes * 60
  const preferredMinimumSeconds = getPreferredMinimumTravelSeconds(safeDriveTimeMinutes)

  if (route.travelTimeSeconds > maxTravelSeconds) {
    return (route.travelTimeSeconds - maxTravelSeconds) + maxTravelSeconds * 2
  }

  if (route.travelTimeSeconds >= preferredMinimumSeconds) {
    return maxTravelSeconds - route.travelTimeSeconds
  }

  // A very short route is still valid, but it is farther from what the user expected.
  return (preferredMinimumSeconds - route.travelTimeSeconds) + maxTravelSeconds
}

function getDestinationDistanceRange(radiusMiles, driveTimeMinutes) {
  const safeDriveTimeMinutes = Number(driveTimeMinutes) || 30
  const isShortDrive = safeDriveTimeMinutes <= 20

  // Time is the main guide here. A large radius should not create a far-away
  // destination when the user only asked for a short round trip.
  const timeBasedMinimumMiles = isShortDrive ? 1.2 : 2.5
  const timeBasedMaximumMiles = isShortDrive ? 5.2 : 9.0
  const maximumMiles = Math.max(0.8, Math.min(radiusMiles * 0.9, timeBasedMaximumMiles))
  const minimumMiles = Math.min(timeBasedMinimumMiles, maximumMiles * 0.55)

  return { minimumMiles, maximumMiles }
}

function createSpreadDistances(radiusMiles, count, driveTimeMinutes) {
  const { minimumMiles, maximumMiles } = getDestinationDistanceRange(
    radiusMiles,
    driveTimeMinutes
  )
  const distanceStep = count > 1 ? (maximumMiles - minimumMiles) / (count - 1) : 0

  const distances = Array.from({ length: count }, (_, index) => {
    const baseDistance = minimumMiles + distanceStep * index
    const smallJitter = (Math.random() - 0.5) * Math.max(0.2, distanceStep * 0.7)
    return clampNumber(baseDistance + smallJitter, minimumMiles, maximumMiles)
  })

  return distances
}

/**
 * Generate destination points within a radius of the starting point.
 * 
 * Parameters:
 *   startingPoint: { lat, lng } - the center point
 *   radiusMiles: number - the radius in miles (e.g., 20)
 *   count: number - how many destination points to generate (e.g., 4)
 *   driveTimeMinutes: number - shorter drives use closer destinations
 * 
 * Returns: array of { lat, lng, distance } objects
 */
export function generateDestinationPoints(startingPoint, radiusMiles, count = 4, driveTimeMinutes = 30) {
  if (!startingPoint) {
    return []
  }

  const safeCount = Math.max(1, count)
  const safeRadiusMiles = Math.max(Number(radiusMiles) || 20, 1)
  const destinations = []
  const angleStep = 360 / safeCount
  const goldenAngle = 137.508
  const randomRotation = Math.random() * 360
  const spreadDistances = createSpreadDistances(safeRadiusMiles, safeCount, driveTimeMinutes)

  // The golden angle keeps candidates spread around the starting point.
  // That avoids testing several destinations in the same small area.
  for (let i = 0; i < safeCount; i++) {
    const jitter = (Math.random() - 0.5) * angleStep * 0.45
    const angle = nudgeAwayFromStraightCompassLines(randomRotation + goldenAngle * i + jitter)
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

export function buildRouteFromTomTomResponse(
  apiResponse,
  startingPoint,
  destination,
  routeNumber,
  routeOptions = {}
) {
  const summary = apiResponse.summary || {}
  const distanceMeters = summary.lengthInMeters ?? 0
  const travelTimeSeconds = summary.travelTimeInSeconds ?? 0
  const trafficDelaySeconds = summary.trafficDelayInSeconds ?? 0
  const routeShape =
    Array.isArray(apiResponse.routeShape) && apiResponse.routeShape.length > 0
      ? apiResponse.routeShape
      : createFallbackRoutePath(startingPoint, destination)
  const tomTomSignals = buildTomTomSignalSummary(apiResponse.instructions, routeShape)

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
    avoidHighways: Boolean(routeOptions.avoidHighways),
    preferLocalRoads: Boolean(routeOptions.preferLocalRoads),
    driveTimeLimitMinutes: Number(routeOptions.driveTimeMinutes) || null,
    instructionCount: tomTomSignals.instructionCount,
    highwayInstructionCount: tomTomSignals.highwayInstructionCount,
    highwayRatio: tomTomSignals.highwayRatio,
    localRoadRatio: tomTomSignals.localRoadRatio,
    turnCount: tomTomSignals.turnCount,
  }
}

export function sortRoutesByDriveTimeFit(routes, driveTimeMinutes) {
  return [...routes].sort((firstRoute, secondRoute) => {
    const firstFit = getTimeFitDistance(firstRoute, driveTimeMinutes)
    const secondFit = getTimeFitDistance(secondRoute, driveTimeMinutes)

    if (firstFit !== secondFit) {
      return firstFit - secondFit
    }

    return firstRoute.trafficDelaySeconds - secondRoute.trafficDelaySeconds
  })
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

function calculateTrafficDelayScore(route) {
  if (!route.travelTimeSeconds) {
    return 0
  }

  return clampNumber(route.trafficDelaySeconds / route.travelTimeSeconds, 0, 1)
}

function calculateTurnScore(route) {
  const miles = Math.max(Number(route.distanceMiles) || 0, 1)
  const turnsPerMile = (Number(route.turnCount) || 0) / miles

  return clampNumber(turnsPerMile / 2.5, 0, 1)
}

function buildQuietScoreExplanation(route) {
  const explanationParts = ['Quiet score based on traffic, road type, turns, and overlap.']

  if (route.preferLocalRoads) {
    explanationParts.push('Local-road preference gives extra weight to routes with fewer highway hints.')
  }

  return explanationParts.join(' ')
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
    const trafficDelayScore = calculateTrafficDelayScore(route)
    const turnScore = calculateTurnScore(route)
    const highwayScore = Number(route.highwayRatio) || 0
    const localRoadRatio = Number(route.localRoadRatio) || 0
    const localRoadBonus = route.preferLocalRoads ? localRoadRatio * 350 : 0
    const highwayWeight = route.preferLocalRoads ? 2600 : 1700

    // These small pieces are easy to reason about:
    // max-time fit + traffic + road type + turns + overlap + repeated out/back roads.
    const timeFitPart = getTimeFitDistance(route, route.driveTimeLimitMinutes) * 0.75
    const distancePart = route.distanceMeters * 0.006
    const trafficPart = route.trafficDelaySeconds * 0.8 + trafficDelayScore * 1600
    const highwayPart = highwayScore * highwayWeight
    const turnPart = turnScore * 1000
    const overlapPart = overlapScore * 2200
    const repetitionPart = repetitionScore * 1800

    return {
      ...route,
      overlapScore,
      repetitionScore,
      trafficDelayScore,
      highwayScore,
      turnScore,
      score: Math.round(
        timeFitPart +
          distancePart +
          trafficPart +
          highwayPart +
          turnPart +
          overlapPart +
          repetitionPart -
          localRoadBonus
      ),
      quietScoreExplanation: buildQuietScoreExplanation(route),
    }
  })

  const routesNeedOffset = routesWithQuality.some((route) => route.overlapScore > 0.14)
  const centerOffset = (routesWithQuality.length - 1) / 2

  return routesWithQuality.map((route, index) => ({
    ...route,
    displayOffset: routesNeedOffset ? index - centerOffset : 0,
  }))
}
