/**
 * Simple in-memory cache with TTL expiry per key.
 *
 * To cache today data for all ~120 prisons, will use ~20kb
 */
export default class HmppsCache<T> {
  private readonly ttl: number // Time to Live in milliseconds

  private cache: Map<string, HmppsCacheData<T>> = new Map<string, HmppsCacheData<T>>()

  /**
   * Constructor.
   *
   * @param ttlMins - Time to Live in minutes
   */
  constructor(ttlMins: number) {
    this.ttl = ttlMins && ttlMins * 1000 * 60
  }

  /**
   * Wrap function with caching for defined period of TTL minutes.
   *
   * @param key - key
   * @param fn - function to call if not using cache, cache is empty, or cache has expired
   */
  public async wrap(key: string, fn: () => Promise<T>): Promise<T> {
    if (!this.ttl) return fn()

    const now = new Date().getTime()
    if (!this.cache.get(key) || this.cache.get(key).expires < now) {
      const data = await fn()
      this.cache.set(key, { data, expires: now + this.ttl })
    }
    return this.cache.get(key).data
  }
}

export interface HmppsCacheData<T> {
  data: T
  expires: number
}
