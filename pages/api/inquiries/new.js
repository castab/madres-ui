import consume from '@/lib/rate-limit'
import parseToFloatOrThrow from '@/lib/parse-float-or-throw'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, otherDetails, token, elapsedMs } = req.body
  if (!name || !email || !token || !elapsedMs) {
    console.debug('Invalid input on inquiry')
    return res.status(400).json({ error: 'Invalid input' })
  }

  const minimumElapsedMs = parseToFloatOrThrow(process.env.FORM_MINIMUM_ELAPSED_MS)
  const maximumElapsedMs = parseToFloatOrThrow(process.env.FORM_MAXIMUM_ELAPSED_MS)
  if (elapsedMs < minimumElapsedMs || elapsedMs > maximumElapsedMs) {
    console.info('Invalid elapsed time on inquiry - likely a bot or otherwise some unecessary submission')
    return res.status(202).json(null)
  }

  // Simple rate limiting per IP
  const remoteHost = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  try {
    await consume(remoteHost)
  } catch {
    console.info(`Rate limit reached for ${remoteHost}`)
    return res.status(202).json(null)
  }

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
    const backendRes = await fetch(`${process.env.BACKEND_URL}/actuator/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`,
      },
    })
    return res.status(backendRes.status).json(null)
  } catch (error) {
    console.error('Error forwarding request:', error)
    return res.status(500).json({ error: 'Backend request failed' })
  }
}
