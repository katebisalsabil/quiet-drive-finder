// routeUtils.js - Utility functions for generating and calculating routes

/**
 * Convert miles to latitude/longitude degrees (approximate)
 * 1 degree of latitude ≈ 69 miles
 * 1 degree of longitude varies by latitude, but we use 69 as average
 * This is a simple approximation for beginner understanding
 */
function milesToDegrees(miles) {
  return miles / 69
}

/**
 * Generate random destination points within a radius of the starting point
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

  const destinations = []
  const radiusDegrees = milesToDegrees(radiusMiles)

  // Generate 'count' random destination points
  for (let i = 0; i < count; i++) {
    // Random angle: 0 to 360 degrees (full circle around the starting point)
    const angle = Math.random() * 360

    // Random distance: 50% to 100% of the radius
    // This prevents points from clustering too close to the center
    const randomDistance = (0.5 + Math.random() * 0.5) * radiusMiles

    // Random distance in degrees
    const distanceDegrees = milesToDegrees(randomDistance)

    // Convert angle and distance to latitude/longitude
    // Using simple trigonometry
    const angleRadians = (angle * Math.PI) / 180
    const newLat = startingPoint.lat + distanceDegrees * Math.cos(angleRadians)
    const newLng = startingPoint.lng + distanceDegrees * Math.sin(angleRadians)

    destinations.push({
      lat: newLat,
      lng: newLng,
      distance: Math.round(randomDistance * 10) / 10, // Round to 1 decimal place
    })
  }

  return destinations
}

/**
 * Generate a route object that includes the round-trip path
 * A round-trip route goes: starting point → destination → starting point
 * 
 * Parameters:
 *   routeNumber: number - for display purposes
 *   startingPoint: { lat, lng } - the starting location
 *   destination: { lat, lng, distance } - the destination
 * 
 * Returns: route object with path and info
 */
export function createRoute(routeNumber, startingPoint, destination) {
  return {
    id: routeNumber,
    startingPoint,
    destination,
    // The path is a round-trip: start → destination → start
    path: [
      [startingPoint.lat, startingPoint.lng],
      [destination.lat, destination.lng],
      [startingPoint.lat, startingPoint.lng],
    ],
    distance: Math.round(destination.distance * 2 * 10) / 10, // Round trip distance
  }
}
