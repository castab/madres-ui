// components/InquiryForm.js
import { useState } from 'react'

export default function InquiryForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Submitting...')

    // Execute reCAPTCHA v3 (you can also use v2 if you prefer)
    const token = await window.grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: 'submit' })
    const res = await fetch('/api/inquiries/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message, recaptchaToken: token }),
    })

    const data = await res.json()
    if (res.ok) setStatus('Submitted successfully!')
    else setStatus(`Error: ${data.error}`)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" required />
      <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Message" required />
      <button type="submit">Submit</button>
      <p>{status}</p>
    </form>
  )
}
