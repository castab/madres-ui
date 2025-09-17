import Footer from '@/components/Footer'
import Header from '@/components/Header'
import HeroContent from '@/components/HeroContent'
import HeroSection from '@/components/HeroSection'
import theme from '@/theme'
import { ThemeProvider } from '@mui/material/styles' // Changed from @emotion/react
import { Alert, Box, Button, Checkbox, Container, CssBaseline, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, Slide, Snackbar, TextField, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import capitalizeFirstLetter from '@/lib/capitalize-first-letter'

const initialEntreeOptions = {
  asada: false,
  adobada: false,
  pollo: false,
  chorizo: false,
  lengua: false,
  veggie: false,
}

const initialDrinkOptions = {
  horchata: false,
  infusedWater: false,
  bottledSoda: false,
}

Object.freeze(initialEntreeOptions)
Object.freeze(initialDrinkOptions)

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

  const handleOnFocus = () => {
    if (!formStartTime) {
      setFormStartTime(Date.now())
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (entreeError) {
      setStatus(`Select at least 2 entree options!`)
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
        body: JSON.stringify({ name, email, otherDetails, token, elapsedMs }),
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

  const handleDrinkChange = (option) => {
    setDrinkOptions(prev => ({
      ...prev,
      [option]: !prev[option],
    }))
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
            value={guestCount}
            onChange={e => {
              const value = e.target.value.replace(/\D/g, '') // Only allow digits
              setGuestCount(value)
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
              {Object.keys(entreeOptions).map(optionKey => (
                <FormControlLabel
                  key={optionKey}
                  control={<Checkbox name={optionKey} checked={entreeOptions[optionKey]} onChange={handleEntreeChange} />}
                  label={capitalizeFirstLetter(optionKey)}
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
              <FormControlLabel
                control={<Checkbox checked={drinkOptions.horchata} onChange={() => handleDrinkChange('horchata')} />}
                label="Horchata"
              />
              <FormControlLabel
                control={<Checkbox checked={drinkOptions.infusedWater} onChange={() => handleDrinkChange('infusedWater')} />}
                label="Infused Water"
              />
              <FormControlLabel
                control={<Checkbox checked={drinkOptions.bottledSoda} onChange={() => handleDrinkChange('bottledSoda')} />}
                label="Bottled Soda"
              />
            </FormGroup>
          </FormControl>
          <TextField
            value={otherDetails}
            onChange={e => setMessage(e.target.value)}
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