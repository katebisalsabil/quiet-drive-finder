// tomtomApi.js - Helper for fetching real driving routes from TomTom

const TOMTOM_ROUTE_TIMEOUT_MS = 15000
const TOMTOM_SEARCH_TIMEOUT_MS = 10000

export async function searchTomTomPlaces(query) {
  // The same TomTom key powers both route generation and address/place search.
  const apiKey = import.meta.env.VITE_TOMTOM_API_KEY

  if (!apiKey) {
    throw new Error('Search API key missing.')
  }

  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return {
      ok: false,
      results: [],
      message: 'No location found. Try a more specific address.',
    }
  }

  const searchParams = new URLSearchParams({
    key: apiKey,
    limit: '5',
    countrySet: 'US',
    language: 'en-US',
    typeahead: 'true',
  })
  const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(trimmedQuery)}.json?${searchParams.toString()}`
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), TOMTOM_SEARCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, { signal: controller.signal })
    const data = await readJsonResponse(response)

    if (!response.ok) {
      return {
        ok: false,
        results: [],
        message: 'No location found. Try a more specific address.',
      }
    }

    const results = mapTomTomSearchResults(data.results)

    return {
      ok: results.length > 0,
      results,
      message: results.length > 0
        ? ''
        : 'No location found. Try a more specific address.',
    }
  } catch (error) {
    const timedOut = error?.name === 'AbortError'

    return {
      ok: false,
      results: [],
      message: timedOut
        ? 'Location search took too long. Try again.'
        : 'No location found. Try a more specific address.',
    }
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export async function fetchTomTomRoute(points, routeOptions = {}) {
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
  const searchParams = new URLSearchParams({
    key: apiKey,
    traffic: 'true',
    routeType: 'fastest',
    computeBestOrder: 'false',
    instructionsType: 'text',
  })

  // TomTom calls highways "motorways" in the avoid setting.
  // "Prefer local roads" uses the same request hint, then scoring gives local roads extra weight.
  if (routeOptions.avoidHighways || routeOptions.preferLocalRoads) {
    searchParams.append('avoid', 'motorways')
  }
  const url = `https://api.tomtom.com/routing/1/calculateRoute/${locationString}/json?${searchParams.toString()}`
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), TOMTOM_ROUTE_TIMEOUT_MS)

  let response
  let data

  try {
    response = await fetch(url, { signal: controller.signal })
    data = await readJsonResponse(response)
  } catch (error) {
    const timedOut = error?.name === 'AbortError'

    return {
      ok: false,
      status: 0,
      data: {},
      routeShape: [],
      legShapes: [],
      summary: null,
      message: timedOut
        ? 'TomTom took too long to answer for one route option.'
        : 'TomTom could not be reached for one route option.',
    }
  } finally {
    window.clearTimeout(timeoutId)
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data,
      routeShape: [],
      legShapes: [],
      summary: null,
      message: `TomTom could not calculate one route option (status ${response.status}).`,
    }
  }

  const route = data.routes?.[0]

  if (!route) {
    return {
      ok: false,
      status: response.status,
      data,
      routeShape: [],
      legShapes: [],
      summary: null,
      message: 'TomTom did not return a route for one destination.',
    }
  }

  const legShapes = extractLegShapes(route)
  const routeShape = legShapes.length > 0 ? combineLegShapes(legShapes) : extractRouteShape(route)

  if (routeShape.length === 0) {
    return {
      ok: false,
      status: response.status,
      data,
      routeShape: [],
      legShapes: [],
      summary: null,
      message: 'TomTom returned a route summary without road points.',
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
    routeShape,
    legShapes,
    instructions: extractGuidanceInstructions(route),
    summary: route?.summary,
  }
}

async function readJsonResponse(response) {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

function mapTomTomSearchResults(results) {
  if (!Array.isArray(results)) {
    return []
  }

  return results
    .map((result) => {
      const lat = result.position?.lat
      const lng = result.position?.lon

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return null
      }

      const placeName = result.poi?.name || result.address?.freeformAddress || result.type || 'Found location'
      const address = result.address?.freeformAddress || result.address?.streetName || ''

      return {
        lat,
        lng,
        placeName,
        address,
        placeId: result.id || '',
      }
    })
    .filter(Boolean)
}

function extractLegShapes(route) {
  if (!route) {
    return []
  }

  // TomTom gives one leg from start to destination and another leg back home.
  // Keeping them separate helps us spot routes that repeat too much.
  if (Array.isArray(route.legs) && route.legs.length > 0) {
    return route.legs
      .map((leg) => {
        const legShape = []

        if (Array.isArray(leg.points) && leg.points.length > 0) {
          leg.points.forEach((point) => {
            const lat = point.latitude ?? point.lat
            const lng = point.longitude ?? point.lon ?? point.lng
            if (typeof lat === 'number' && typeof lng === 'number') {
              legShape.push([lat, lng])
            }
          })
        }

        return legShape
      })
      .filter((legShape) => legShape.length > 0)
  }

  return []
}

function combineLegShapes(legShapes) {
  const combinedShape = []

  legShapes.forEach((legShape) => {
    legShape.forEach((point) => {
      const lastPoint = combinedShape[combinedShape.length - 1]
      const isDuplicatePoint =
        lastPoint && lastPoint[0] === point[0] && lastPoint[1] === point[1]

      if (!isDuplicatePoint) {
        combinedShape.push(point)
      }
    })
  })

  return combinedShape
}

function textOrEmpty(value) {
  return typeof value === 'string' ? value : ''
}

function arrayOfText(value) {
  return Array.isArray(value) ? value.map(String) : []
}

function extractGuidanceInstructions(route) {
  const instructions = route?.guidance?.instructions

  if (!Array.isArray(instructions)) {
    return []
  }

  return instructions
    .map((instruction) => ({
      message: textOrEmpty(instruction.message),
      maneuver: textOrEmpty(instruction.maneuver),
      street: textOrEmpty(instruction.street || instruction.roadName || instruction.streetName),
      signpostText: textOrEmpty(instruction.signpostText || instruction.signpost || instruction.towards),
      roadNumbers: arrayOfText(instruction.roadNumbers),
    }))
    .filter((instruction) => {
      return (
        instruction.message ||
        instruction.maneuver ||
        instruction.street ||
        instruction.signpostText ||
        instruction.roadNumbers.length > 0
      )
    })
}

function extractRouteShape(route) {
  if (!route) {
    return []
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
