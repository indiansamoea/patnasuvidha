import { useMemo } from 'react';
import Fuse from 'fuse.js';

/**
 * Hook for Zero-Cost Client-Side Smart Search
 * @param {Array} initialBusinesses - The array of business data
 * @param {string} searchQuery - The user's input string
 * @returns {Array} - The filtered results
 */
export function useBusinessSearch(initialBusinesses, searchQuery) {
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'name', weight: 0.5 },
        { name: 'category', weight: 0.3 },
        { name: 'address', weight: 0.2 },
      ],
      threshold: 0.3, // Fuzzy matching tolerance (0.0 is exact, 1.0 is matches anything)
      distance: 100,  // How close to the start of the string the match should be
      ignoreLocation: true,
      minMatchCharLength: 2,
    };
    return new Fuse(initialBusinesses || [], options);
  }, [initialBusinesses]);

  const results = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      return initialBusinesses || [];
    }
    const searchResults = fuse.search(searchQuery);
    return searchResults.map(result => result.item);
  }, [fuse, searchQuery, initialBusinesses]);

  return results;
}
