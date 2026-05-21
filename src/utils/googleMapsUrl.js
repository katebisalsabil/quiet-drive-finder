// googleMapsUrl.js - Build regular Google Maps directions links.
// This does not call a Google API and does not need a Google API key.

const MAX_EXTRA_SHAPE_WAYPOINTS = 2

function pointToCoordinates(point) {
  if (Array.isArray(point)) {
    return { lat: point[0], lng: point[1] }
  }

  return point
}

function formatCoordinates(point) {
  const coordinates = pointToCoordinates(point)

  return `${coordinates.lat.toFixed(6)},${coordinates.lng.toFixed(6)}`
}

function getPointDistanceScore(firstPoint, secondPoint) {
  const first = pointToCoordinates(firstPoint)
  const second = pointToCoordinates(secondPoint)
  const latDifference = first.lat - second.lat
  const lngDifference = first.lng - second.lng

  return latDifference * latDifference + lngDifference * lngDifference
}

function findClosestPathIndex(path, targetPoint) {
  if (!Array.isArray(path) || path.length === 0) {
    return -1
  }

  let closestIndex = 0
  let closestScore = Number.POSITIVE_INFINITY

  path.forEach((pathPoint, index) => {
    const score = getPointDistanceScore(pathPoint, targetPoint)

    if (score < closestScore) {
      closestIndex = index
      closestScore = score
    }
  })

  return closestIndex
}

function isTooCloseToImportantPoint(point, route) {
  const closeEnoughScore = 0.00008 * 0.00008

  return (
    getPointDistanceScore(point, route.startingPoint) < closeEnoughScore ||
    getPointDistanceScore(point, route.destination) < closeEnoughScore
  )
}

function getShapeWaypointCandidates(route) {
  const path = Array.isArray(route.path) ? route.path : []
  const destinationIndex = findClosestPathIndex(path, route.destination)

  if (path.length < 8 || destinationIndex < 2) {
    return []
  }

  const outboundIndex = Math.floor(destinationIndex * 0.55)
  const returnLegLength = path.length - destinationIndex - 1
  const returnIndex = destinationIndex + Math.floor(returnLegLength * 0.45)

  return [path[outboundIndex], path[returnIndex]]
    .filter(Boolean)
    .filter((point) => !isTooCloseToImportantPoint(point, route))
    .slice(0, MAX_EXTRA_SHAPE_WAYPOINTS)
}

export function buildGoogleMapsDirectionsUrl(route) {
  const origin = formatCoordinates(route.startingPoint)
  const destination = formatCoordinates(route.startingPoint)
  const destinationPoint = formatCoordinates(route.destination)

  // Google Maps URLs support origin, destination, travel mode, and waypoints.
  // The destination is the starting point again, which makes this a round trip.
  // The generated destination plus a few TomTom path points help Google Maps
  // approximate the quiet route, but Google may still adjust it.
  const shapeWaypoints = getShapeWaypointCandidates(route).map(formatCoordinates)
  const waypoints = [
    shapeWaypoints[0],
    destinationPoint,
    shapeWaypoints[1],
  ].filter(Boolean)

  const searchParams = new URLSearchParams({
    api: '1',
    origin,
    destination,
    travelmode: 'driving',
    waypoints: waypoints.join('|'),
  })

  return `https://www.google.com/maps/dir/?${searchParams.toString()}`
}
