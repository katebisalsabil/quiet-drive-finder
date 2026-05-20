// tomtomApi.js - Helper for fetching real driving routes from TomTom

export async function fetchTomTomRoute(points) {
  // Read the API key from Vite environment variables
  const apiKey = import.meta.env.VITE_TOMTOM_API_KEY

  if (!apiKey) {
    throw new Error(
      'TomTom API key is missing. Please add VITE_TOMTOM_API_KEY to your .env file.'
    )
  }

  if (!Array.isArray(points) || points.length < 2) {
    throw new Error('TomTom routing needs at least two points.')
  }

  const locationString = points.map((point) => `${point.lat},${point.lng}`).join(':')
  const url = `https://api.tomtom.com/routing/1/calculateRoute/${locationString}/json?key=${apiKey}&traffic=true&routeType=fastest&computeBestOrder=false&instructionsType=text`

  const response = await fetch(url)
  const data = await response.json()

  const route = data.routes?.[0]
  const routeShape = extractRouteShape(route)

  return {
    ok: response.ok,
    status: response.status,
    data,
    routeShape,
    summary: route?.summary,
  }
}

function extractRouteShape(route) {
  if (!route) {
    return []
  }

  // TomTom routes can include per-leg points, which are the coordinates we need for drawing.
  if (Array.isArray(route.legs) && route.legs.length > 0) {
    const shape = []

    route.legs.forEach((leg) => {
      if (Array.isArray(leg.points) && leg.points.length > 0) {
        leg.points.forEach((point) => {
          const lat = point.latitude ?? point.lat
          const lng = point.longitude ?? point.lon ?? point.lng
          if (typeof lat === 'number' && typeof lng === 'number') {
            shape.push([lat, lng])
          }
        })
      }
    })

    if (shape.length > 0) {
      return shape
    }
  }

  // Fallback: some route responses may provide a generic shape array.
  if (Array.isArray(route.shape) && route.shape.length > 0) {
    return route.shape
      .map((entry) => {
        if (Array.isArray(entry) && entry.length === 2) {
          return [entry[0], entry[1]]
        }
        if (typeof entry === 'string') {
          const [lat, lng] = entry.split(',').map(Number)
          return [lat, lng]
        }
        return null
      })
      .filter((item) => item && item.length === 2)
  }

  return []
}
