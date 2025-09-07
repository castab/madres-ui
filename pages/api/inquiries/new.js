// pages/api/save.js
import consume from '@/lib/rate-limit' // optional, see below

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Optional: simple rate limiting per IP
  try {
    await consume(req.headers['x-forwarded-for'] || req.socket.remoteAddress)
  } catch {
    return res.status(429).json({ error: 'Too many requests' })
  }

  const { name, email, message, recaptchaToken } = req.body
  if (!name || !email || !message || !recaptchaToken) {
    return res.status(400).json({ error: 'Invalid input' })
  }

  // Verify reCAPTCHA
  const captchaRes = await fetch(
    `https://recaptchaenterprise.googleapis.com/v1/projects/madres-taco-shop/assessments?key=${process.env.RECAPTCHA_API_KEY}`,
    { 
      method: 'POST',
      body: JSON.stringify({
        event: {
          token: recaptchaToken,
          expectedAction: 'USER_ACTION',
          siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
        },
      }),
    },
  )
  const captchaData = await captchaRes.json()
  if (!captchaData.tokenProperties.valid || captchaData.riskAnalysis.score < 0.75) {
    return res.status(403).json({ error: 'Failed CAPTCHA check' })
  }

  // Forward to backend
  try {
    const backendRes = await fetch(`${process.env.BACKEND_URL}/save`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`,
      }
    })
    return res.status(backendRes.status).json(null)
  } catch (error) {
    console.error('Error forwarding request:', error)
    return res.status(500).json({ error: 'Backend request failed' })
  }
}
