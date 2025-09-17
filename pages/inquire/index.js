import Footer from '@/components/Footer'
import Header from '@/components/Header'
import HeroContent from '@/components/HeroContent'
import HeroSection from '@/components/HeroSection'
import theme from '@/theme'
import { ThemeProvider } from '@mui/material/styles' // Changed from @emotion/react
import { Alert, Box, Button, Checkbox, Container, CssBaseline, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, Slide, Snackbar, TextField, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import clamp from '@/lib/clamp'
import { DRINK_LABELS, ENTREE_LABELS, initialDrinkOptions, initialEntreeOptions } from '@/constants/formOptions'

export default function InquiryForm() {
  const [formStartTime, setFormStartTime] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [otherDetails, setOtherDetails] = useState('')
  const [status, setStatus] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarSeverity, setSnackbarSeverity] = useState('')
  const [guestCount, setGuestCount] = useState('')
  const [entreeOptions, setEntreeOptions] = useState(initialEntreeOptions)
  const [entreeError, setEntreeError] = useState(undefined)
  const [drinkOptions, setDrinkOptions] = useState(initialDrinkOptions)
  const [honeypot, setHoneypot] = useState('')

  const handleOnFocus = () => {
    if (!formStartTime) {
      setFormStartTime(Date.now())
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (entreeError) {
      setStatus('Select at least 2 entree options!')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return
    }
    setStatus('Submitting...')
    const elapsedMs = formStartTime ? Date.now() - formStartTime : null
    try {
      const token = await window.grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: 'submit' })
      const res = await fetch('/api/inquiries/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          otherDetails, 
          guestCount,
          entreeOptions,
          drinkOptions,
          token, 
          elapsedMs,
          honeypot,
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
        setEntreeOptions(initialEntreeOptions)
        setDrinkOptions(initialDrinkOptions)
        setHoneypot('') // Clear honeypot
        setFormStartTime(undefined)
        // Reset the entree error state and first render flag
        setEntreeError(undefined)
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

  const handleEntreeChange = (e) => {
    setEntreeOptions({
      ...entreeOptions,
      [e.target.name]: e.target.checked,
    })
  }

  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const selectedCount = Object.values(entreeOptions).filter(value => value === true).length
    if (selectedCount >= 2) {
      setEntreeError(false)
    } else {
      setEntreeError(true)
    }
  }, [entreeOptions])

  const handleDrinkChange = (e) => {
    setDrinkOptions({
      ...drinkOptions,
      [e.target.name]: e.target.checked,
    })
  }

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
          <TextField
            value={honeypot}
            onChange={e => setHoneypot(e.target.value)}
            label="Company Name"
            name="company"
            variant="outlined"
            aria-hidden
            sx={{
              position: 'absolute',
              left: '-9999px',
              visibility: 'hidden',
              opacity: 0,
              height: 0,
              width: 0,
              overflow: 'hidden',
              tabIndex: -1,
            }}
            tabIndex={-1}
            autoComplete="off"
          />
          <TextField
            value={name}
            onChange={e => setName(e.target.value.trim().slice(0, 100))}
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

          <FormControl component="fieldset" required error={entreeError}>
            <FormLabel component="legend" sx={{ color: 'text.primary', mb: 1 }}>
                  Entree Options (select at least 2)
            </FormLabel>
            <FormGroup>
              {Object.keys(entreeOptions).map(entreeOption => (
                <FormControlLabel
                  key={entreeOption}
                  control={<Checkbox name={entreeOption} checked={entreeOptions[entreeOption]} onChange={handleEntreeChange} />}
                  label={ENTREE_LABELS[entreeOption]}
                />
              ))}
              {entreeError && <FormHelperText>Gotta pick at least 2!</FormHelperText>}
            </FormGroup>
          </FormControl>

          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ color: 'text.primary', mb: 1 }}>
                  Drink Options (optional)
            </FormLabel>
            <FormGroup>
              {Object.keys(drinkOptions).map(drinkOption => (
                <FormControlLabel
                  key={drinkOption}
                  control={<Checkbox name={drinkOption} checked={drinkOptions[drinkOption]} onChange={handleDrinkChange} />}
                  label={DRINK_LABELS[drinkOption]}
                />
              ))}
            </FormGroup>
          </FormControl>
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