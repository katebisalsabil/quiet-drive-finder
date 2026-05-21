import { useState } from 'react'
import { searchTomTomPlaces } from '../utils/tomtomApi'
import '../styles/PlaceSearch.css'

function getResultLabel(result) {
  if (result.address && result.address !== result.placeName) {
    return `${result.placeName} - ${result.address}`
  }

  return result.placeName
}

function PlaceSearch({ onPlaceSelect }) {
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [statusMessage, setStatusMessage] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  function selectResult(result) {
    setSearchText(getResultLabel(result))
    setSearchResults([])
    setStatusMessage(`Starting point set to ${getResultLabel(result)}.`)
    onPlaceSelect(result)
  }

  async function handleSearch() {
    const trimmedSearchText = searchText.trim()

    if (!trimmedSearchText) {
      setSearchResults([])
      setStatusMessage('No location found. Try a more specific address.')
      return
    }

    setIsSearching(true)
    setStatusMessage('')

    try {
      // TomTom Search turns a typed address or place name into latitude/longitude.
      const searchResponse = await searchTomTomPlaces(trimmedSearchText)

      if (!searchResponse.ok) {
        setSearchResults([])
        setStatusMessage(searchResponse.message || 'No location found. Try a more specific address.')
        return
      }

      setSearchResults(searchResponse.results)
      setStatusMessage('Choose a search result below.')

      if (searchResponse.results.length === 1) {
        selectResult(searchResponse.results[0])
      }
    } catch (error) {
      setSearchResults([])
      setStatusMessage(error?.message || 'No location found. Try a more specific address.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="place-search">
      <label htmlFor="place-search-input">
        <strong>Search address or place</strong>
      </label>
      <div className="place-search-row">
        <input
          id="place-search-input"
          type="text"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              handleSearch()
            }
          }}
          placeholder="Home address or Macomb Community College"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>
      <p className="place-search-help">
        Search uses TomTom. Map click still works as a backup.
      </p>
      {statusMessage && (
        <p className="place-search-status" aria-live="polite">
          {statusMessage}
        </p>
      )}
      {searchResults.length > 0 && (
        <ul className="place-search-results">
          {searchResults.map((result) => (
            <li key={`${result.placeId}-${result.lat}-${result.lng}`}>
              <button
                type="button"
                onClick={() => selectResult(result)}
              >
                <strong>{result.placeName}</strong>
                {result.address && <span>{result.address}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PlaceSearch
