import { useEffect, useRef, useState } from 'react'
import '../styles/PlaceSearch.css'

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-places-script'

function getGoogleMapsApiKey() {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY
}

function loadGooglePlacesLibrary(apiKey) {
  if (window.google?.maps?.places) {
    return Promise.resolve(window.google)
  }

  if (window.__quietDriveGoogleMapsPromise) {
    return window.__quietDriveGoogleMapsPromise
  }

  window.__quietDriveGoogleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID)

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google))
      existingScript.addEventListener('error', () => reject(new Error('Google Places could not load.')))
      return
    }

    const script = document.createElement('script')
    const searchParams = new URLSearchParams({
      key: apiKey,
      libraries: 'places',
      loading: 'async',
    })

    script.id = GOOGLE_MAPS_SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?${searchParams.toString()}`
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve(window.google))
    script.addEventListener('error', () => reject(new Error('Google Places could not load.')))

    document.head.appendChild(script)
  })

  return window.__quietDriveGoogleMapsPromise
}

function getPlaceLocation(place) {
  const location = place?.geometry?.location

  if (!location) {
    return null
  }

  return {
    lat: location.lat(),
    lng: location.lng(),
  }
}

function PlaceSearch({ onPlaceSelect }) {
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [isReady, setIsReady] = useState(false)
  const googleMapsApiKey = getGoogleMapsApiKey()

  useEffect(() => {
    if (!googleMapsApiKey) {
      return undefined
    }

    let isMounted = true
    let placeChangedListener = null

    loadGooglePlacesLibrary(googleMapsApiKey)
      .then((google) => {
        if (!isMounted || !inputRef.current) {
          return
        }

        // Autocomplete watches the text input and returns a place when the user selects a result.
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ['geometry', 'name', 'formatted_address', 'place_id'],
        })

        placeChangedListener = autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace()
          const location = getPlaceLocation(place)

          if (!location) {
            setStatusMessage('Please choose a place from the search suggestions.')
            return
          }

          const label = place.formatted_address || place.name || 'Selected place'

          inputRef.current.value = label
          setStatusMessage(`Starting point set to ${label}.`)
          onPlaceSelect({
            lat: location.lat,
            lng: location.lng,
            placeName: place.name || '',
            address: place.formatted_address || '',
            placeId: place.place_id || '',
          })
        })

        setIsReady(true)
        setStatusMessage('')
      })
      .catch(() => {
        if (isMounted) {
          setStatusMessage('Google place search could not load. You can still click the map.')
        }
      })

    return () => {
      isMounted = false

      if (placeChangedListener) {
        placeChangedListener.remove()
      }
    }
  }, [googleMapsApiKey, onPlaceSelect])

  const visibleStatusMessage = googleMapsApiKey
    ? statusMessage
    : 'Add VITE_GOOGLE_MAPS_API_KEY to use place search.'

  return (
    <div className="place-search">
      <label htmlFor="place-search-input">
        <strong>Search address or place</strong>
      </label>
      <input
        id="place-search-input"
        ref={inputRef}
        type="text"
        placeholder="Search address or place"
        disabled={!googleMapsApiKey}
        autoComplete="off"
      />
      <p className="place-search-help">
        {isReady ? 'Choose a Google suggestion to set the starting point.' : 'Map click still works as a backup.'}
      </p>
      {visibleStatusMessage && (
        <p className="place-search-status" aria-live="polite">
          {visibleStatusMessage}
        </p>
      )}
    </div>
  )
}

export default PlaceSearch
