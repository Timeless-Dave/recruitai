import stringSimilarity from 'string-similarity'

// All valid routes in the app
export const validRoutes = [
  // Main routes
  '/',
  '/dashboard',
  
  // Job routes
  '/jobs',
  '/jobs/create',
  '/jobs/browse',
  
  // User routes
  '/applicants',
  '/applications',
  '/profile',
  '/settings',
  
  // Analytics & Reports
  '/analytics',
  '/reports',
  '/notifications',
  '/interviews',
]

export interface RouteSuggestion {
  route: string
  score: number
}

/**
 * Find the best matching route for a given path
 * @param path - The path to match
 * @param threshold - Minimum similarity score (0-1) to consider a match
 * @returns The best matching route or null if no good match found
 */
export function findBestMatch(path: string, threshold: number = 0.4): string | null {
  let bestMatch = ''
  let bestScore = 0

  validRoutes.forEach(route => {
    const score = stringSimilarity.compareTwoStrings(path.toLowerCase(), route.toLowerCase())
    if (score > bestScore) {
      bestScore = score
      bestMatch = route
    }
  })

  return bestScore >= threshold ? bestMatch : null
}

/**
 * Get top N route suggestions for a given path
 * @param path - The path to match
 * @param topN - Number of suggestions to return
 * @param threshold - Minimum similarity score (0-1) to consider
 * @returns Array of route suggestions sorted by score
 */
export function getRouteSuggestions(
  path: string, 
  topN: number = 3, 
  threshold: number = 0.3
): RouteSuggestion[] {
  const suggestions: RouteSuggestion[] = []

  validRoutes.forEach(route => {
    const score = stringSimilarity.compareTwoStrings(path.toLowerCase(), route.toLowerCase())
    if (score >= threshold) {
      suggestions.push({ route, score })
    }
  })

  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}

/**
 * Check if a path is a valid route
 * @param path - The path to check
 * @returns True if the path is a valid route
 */
export function isValidRoute(path: string): boolean {
  return validRoutes.includes(path)
}

