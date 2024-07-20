import { useEffect, useState } from 'react'

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState<boolean>(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }
    mediaQuery.addEventListener('change', handleMediaQueryChange)
    setMatches(mediaQuery.matches)

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange)
    }
  }, [query])

  return matches
}

export default useMediaQuery
