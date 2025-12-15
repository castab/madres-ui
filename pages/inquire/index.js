import Footer from '@/components/Footer'
import Header from '@/components/Header'
import HeroContent from '@/components/HeroContent'
import HeroSection from '@/components/HeroSection'
import theme from '@/theme'
import { ThemeProvider } from '@mui/material/styles' // Changed from @emotion/react
import { Alert, Box, Button, Container, CssBaseline, Slide, Snackbar, TextField, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import clamp from '@/lib/clamp'
import BeverageSelection from '@/components/form/BeverageSelection'
import EntreeSelection from '@/components/form/EntreeSelection'
import AppetizerSelection from '@/components/form/AppetizerSelection'
import Honeypot from '@/components/form/Honeypot'

export default function InquiryForm() {
  const [formStartTime, setFormStartTime] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [otherDetails, setOtherDetails] = useState('')
  const [status, setStatus] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarSeverity, setSnackbarSeverity] = useState('')
  const [guestCount, setGuestCount] = useState('')
  const [selectedEntrees, setSelectedEntrees] = useState([]);
  const [selectedBeverages, setSelectedBeverages] = useState([]);
  const [selectedAppetizers, setSelectedAppetizers] = useState([]);
  const [honeypotValue, setHoneypotValue] = useState('')

  const handleOnFocus = () => {
    if (!formStartTime) {
      setFormStartTime(Date.now())
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (selectedEntrees.length < 2) {
      setStatus('Select at least 2 entree options!')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return
    }
    setStatus('Submitting...')
    const elapsedMs = formStartTime ? Date.now() - formStartTime : null
    try {
      const token = await window.grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: 'submit' })
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          otherDetails, 
          guestCount,
          selectedEntrees,
          selectedBeverages,
          token, 
          elapsedMs,
          honeypotValue,
        }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setStatus('Thanks! We\'ll get back to you soon! 😊')
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
        // Clear form on success
        setName('')
        setEmail('')
        setOtherDetails('')
        setGuestCount('')
        setSelectedEntrees([])
        setSelectedBeverages([])
        setHoneypotValue('') // Clear honeypot
        setFormStartTime(undefined)
        // Reset the first render flag
        isFirstRender.current = true
      } else {
        const error = data?.error || 'Unknown error'
        setStatus(`Error: ${error}`)
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
      }
    } catch (error) {
      console.error(error)
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

  const isFirstRender = useRef(true)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <HeroSection sx={{ minHeight: '12vh' }}>
        <Container maxWidth="lg">
          <HeroContent>
            <Typography 
              variant="h5" 
              component="p" 
              sx={{ 
                fontSize: { xs: '1.75rem', md: '2rem' },
                mt: 4,
                maxWidth: '600px',
                margin: '5.5rem auto 2rem auto',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
                          Let's make it happen! 🎉
            </Typography>
          </HeroContent>
        </Container>
      </HeroSection>
      <Container maxWidth='lg'>
        <Box component="form" 
          onSubmit={handleSubmit} 
          sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 3, backgroundColor: 'background.default' }}
          onFocus={handleOnFocus}
        >
          Give us a few details about your event and we'll handle the rest!
          
          {/* Honeypot field - hidden from users */}
          <Honeypot honeypotValue={honeypotValue} onHoneypotChange={setHoneypotValue} />

          <TextField
            value={name}
            onChange={e => setName(e.target.value.slice(0, 100))}
            label="Name"
            variant="outlined"
            required
            fullWidth
          />
          <TextField
            value={email}
            onChange={e => setEmail(e.target.value.trim().slice(0, 100))}
            label="Email"
            type="email"
            variant="outlined"
            required
            fullWidth
          />
          <TextField
            value={guestCount}
            onChange={e => {
              if (e.target.value == '') {
                setGuestCount('')
                return
              }
              const value = e.target.value.replace(/\D/g, '') // Only allow digits
              const clampedValue = clamp(value, 1, 500)
              setGuestCount(clampedValue)
            }}
            label="Guest Count"
            variant="outlined"
            required
            fullWidth
            helperText="Please enter number of guests"
          />

          <AppetizerSelection selectedAppetizers={selectedAppetizers} onSelectionChange={setSelectedAppetizers} />
          <EntreeSelection selectedEntrees={selectedEntrees} onSelectionChange={setSelectedEntrees} />
          <BeverageSelection selectedBeverages={selectedBeverages} onSelectionChange={setSelectedBeverages} />

          <TextField
            value={otherDetails}
            onChange={e => setOtherDetails(e.target.value)}
            label="Other Details"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
          />
          <Button 
            type="submit" 
            variant="contained" 
            size="large"
            sx={{ mt: 2 }}
            disabled={status === 'Submitting...'}
          >
                Send Inquiry
          </Button>
        </Box>
      </Container>
      
      <Footer />
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={5000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slots={{ transition: Slide }}
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