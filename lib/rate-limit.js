// lib/rate-limit.js
import LRU from 'lru-cache'

class RateLimiter {
  constructor(options = {}) {
    this.limit = options.limit || 2
    this.windowMs = options.windowMs || 60 * 1000 // 1 minute
    this.maxKeys = options.maxKeys || 500
    
    this.cache = new LRU({
      max: this.maxKeys,
      ttl: this.windowMs,
    })
  }

  async consume(key) {
    const now = Date.now()
    const count = this.cache.get(key) || 0
    const remaining = Math.max(0, this.limit - count - 1)
    const resetTime = now + this.windowMs
    
    const result = {
      limit: this.limit,
      remaining,
      reset: resetTime,
      resetDate: new Date(resetTime),
      retryAfter: Math.ceil(this.windowMs / 1000), // seconds
      success: count < this.limit
    }

    if (count >= this.limit) {
      // Calculate more accurate retry-after based on when the window resets
      const oldestEntry = this.cache.get(key + '_timestamp') || now
      const timeUntilReset = Math.max(0, oldestEntry + this.windowMs - now)
      result.retryAfter = Math.ceil(timeUntilReset / 1000)
      
      throw new RateLimitError('Rate limit exceeded', result)
    }

    // Store both count and timestamp for more accurate reset calculations
    this.cache.set(key, count + 1)
    this.cache.set(key + '_timestamp', now)

    return result
  }

  // Get current status without consuming
  getStatus(key) {
    const now = Date.now()
    const count = this.cache.get(key) || 0
    const remaining = Math.max(0, this.limit - count)
    const resetTime = now + this.windowMs

    return {
      limit: this.limit,
      remaining,
      reset: resetTime,
      resetDate: new Date(resetTime),
      retryAfter: Math.ceil(this.windowMs / 1000),
      success: remaining > 0
    }
  }
}

class RateLimitError extends Error {
  constructor(message, rateLimitInfo) {
    super(message)
    this.name = 'RateLimitError'
    this.rateLimitInfo = rateLimitInfo
    this.status = 429
  }
}

// Create default instance
const defaultLimiter = new RateLimiter()

// Export both the class and a default instance
export { RateLimiter, RateLimitError }
export default defaultLimiter.consume.bind(defaultLimiter)
