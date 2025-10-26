// Caching utilities for API calls and data

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  // Set cache entry
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    })
  }

  // Get cache entry
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  // Delete cache entry
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
  }

  // Get cache size
  size(): number {
    return this.cache.size
  }

  // Get cache keys
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  // Clean expired entries
  cleanExpired(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Create singleton instance
export const cacheManager = new CacheManager()

// Cache decorator for functions
export function cached<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    // Try to get from cache first
    const cached = cacheManager.get<ReturnType<T>>(key)
    if (cached !== null) {
      return Promise.resolve(cached)
    }

    // Execute function and cache result
    const result = fn(...args)
    
    // Handle both sync and async functions
    if (result instanceof Promise) {
      return result.then((data) => {
        cacheManager.set(key, data, ttl)
        return data
      })
    } else {
      cacheManager.set(key, result, ttl)
      return result
    }
  }) as T
}

// Cache key generators
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user_profile:${id}`,
  posts: (page: number, limit: number) => `posts:${page}:${limit}`,
  userPosts: (userId: string, page: number) => `user_posts:${userId}:${page}`,
  teams: (page: number, limit: number) => `teams:${page}:${limit}`,
  championships: (page: number, limit: number) => `championships:${page}:${limit}`,
  search: (query: string, filters: any) => `search:${JSON.stringify({ query, filters })}`,
}

// Cache TTL constants
export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
}

// React hook for cached data
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): { data: T | null; loading: boolean; error: Error | null; refetch: () => void } {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  const fetchData = React.useCallback(async () => {
    // Check cache first
    const cached = cacheManager.get<T>(key)
    if (cached !== null) {
      setData(cached)
      setLoading(false)
      return
    }

    // Fetch from source
    try {
      setLoading(true)
      setError(null)
      const result = await fetcher()
      cacheManager.set(key, result, ttl)
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, ttl])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = React.useCallback(() => {
    cacheManager.delete(key)
    fetchData()
  }, [key, fetchData])

  return { data, loading, error, refetch }
}

// Import React for the hook
import React from 'react'
