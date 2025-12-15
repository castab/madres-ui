import consume, { RateLimitError } from '@/lib/rate-limit'
import parseToFloatOrThrow from '@/lib/parse-float-or-throw'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const {
    name,
    email,
    otherDetails,
    guestCount,
    selectedEntrees,
    selectedBeverages,
    token,
    elapsedMs,
    honeypotValue,
  } = req.body

  if (!name || !email || !guestCount || !selectedEntrees || !selectedBeverages || !token || !elapsedMs) {
    console.debug('Invalid input on inquiry')
    return res.status(400).json({ error: 'Invalid input' })
  }

  if (honeypotValue) {
    console.info('Honeypot field filled - likely spam submission')
    return res.status(202).json(null)
  }

  const minimumElapsedMs = parseToFloatOrThrow(process.env.FORM_MINIMUM_ELAPSED_MS)
  const maximumElapsedMs = parseToFloatOrThrow(process.env.FORM_MAXIMUM_ELAPSED_MS)

  if (elapsedMs < minimumElapsedMs || elapsedMs > maximumElapsedMs) {
    console.info('Invalid elapsed time on inquiry - likely a bot or otherwise some unecessary submission')
    return res.status(202).json(null)
  }

  // Enhanced rate limiting per IP
  const remoteHost = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  let rateLimitInfo

  try {
    rateLimitInfo = await consume(remoteHost)
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.info(`Rate limit reached for ${remoteHost}`)

      res.setHeader('X-RateLimit-Limit', error.rateLimitInfo.limit)
      res.setHeader('X-RateLimit-Remaining', error.rateLimitInfo.remaining)
      res.setHeader('X-RateLimit-Reset', error.rateLimitInfo.reset)
      res.setHeader('Retry-After', error.rateLimitInfo.retryAfter)

      return res.status(429).json({
        error: `Rate limit exceeded, try again in ${error.rateLimitInfo.retryAfter} seconds.`,
        message: `Too many requests. Try again in ${error.rateLimitInfo.retryAfter} seconds.`,
        retryAfter: error.rateLimitInfo.retryAfter,
        resetTime: error.rateLimitInfo.resetDate.toISOString()
      })
    }

    // Re-throw if it's not a rate limit error
    throw error
  }

  // Add rate limit headers to successful responses
  res.setHeader('X-RateLimit-Limit', rateLimitInfo.limit)
  res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining)
  res.setHeader('X-RateLimit-Reset', rateLimitInfo.reset)

  // Verify reCAPTCHA
  const captchaRes = await fetch(
    `https://recaptchaenterprise.googleapis.com/v1/projects/madres-taco-shop/assessments?key=${process.env.RECAPTCHA_API_KEY}`,
    {
      method: 'POST',
      body: JSON.stringify({
        event: {
          token: token,
          expectedAction: 'USER_ACTION',
          siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
        },
      }),
    },
  )

  const captchaData = await captchaRes.json()
  const minimumRequiredScore = parseToFloatOrThrow(process.env.RECAPTCHA_MINIMUM_REQUIRED_SCORE)

  if (!captchaData.tokenProperties.valid || captchaData.riskAnalysis.score < minimumRequiredScore) {
    return res.status(403).json({ error: 'Failed CAPTCHA check' })
  }

  // Forward to backend
  try {
    const backendRes = await fetch(`${process.env.BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })

    return res.status(backendRes.status).json(null)
  } catch (error) {
    console.error('Error forwarding request:', error)
    return res.status(500).json({ error: 'Backend request failed' })
  }
}
