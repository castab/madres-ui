import Footer from '@/components/Footer'
import Header from '@/components/Header'
import HeroContent from '@/components/HeroContent'
import HeroSection from '@/components/HeroSection'
import theme from '@/theme'
import { ThemeProvider } from '@mui/material/styles' // Changed from @emotion/react
import { Alert, Box, Button, Container, CssBaseline, Snackbar, TextField, Typography } from '@mui/material'
import { useState } from 'react'

export default function InquiryForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarSeverity, setSnackbarSeverity] = useState('')
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Submitting...')
    
    try {
      const token = await window.grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: 'submit' })
      const res = await fetch('/api/inquiries/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, token: token }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setStatus(`Thanks! We'll get back to you soon! 😊`)
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
        // Clear form on success
        setName('')
        setEmail('')
        setMessage('')
      } else {
        const error = data?.error || 'Unknown error'
        setStatus(`Error: ${error}`)
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
      }
    } catch (error) {
      setStatus('Network error occurred')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <HeroSection>
        <Container maxWidth="lg">
          <HeroContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                value={name}
                onChange={e => setName(e.target.value)}
                label="Name"
                variant="outlined"
                required
                fullWidth
              />
              <TextField
                value={email}
                onChange={e => setEmail(e.target.value)}
                label="Email"
                type="email"
                variant="outlined"
                required
                fullWidth
              />
              <TextField
                value={message}
                onChange={e => setMessage(e.target.value)}
                label="Message"
                multiline
                rows={4}
                variant="outlined"
                required
                fullWidth
              />
              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                sx={{ mt: 2 }}
              >
                Submit
              </Button>
            </Box>
          </HeroContent>
        </Container>
      </HeroSection>
      <Footer />
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={10000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%', backgroundColor: '#BB9D4C', color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}
        >
          {status}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  )
}