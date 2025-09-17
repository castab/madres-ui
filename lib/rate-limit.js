// lib/rate-limit.js
import LRU from 'lru-cache'

const limiter = new LRU({
  max: 500, // max 500 unique IPs
  ttl: 60 * 1000, // 1 minute
})

const consume = async (key) => {
  const count = limiter.get(key) || 0
  if (count >= 2) throw new Error('Rate limit exceeded') // max 2 requests per minute
  limiter.set(key, count + 1)
}

export default consume
