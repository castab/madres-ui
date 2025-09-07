import Footer from '@/components/Footer'
import Header from '@/components/Header'
import HeroContent from '@/components/HeroContent'
import HeroSection from '@/components/HeroSection'
import theme from '@/theme'
import { ThemeProvider } from '@mui/material/styles' // Changed from @emotion/react
import { Alert, Box, Button, Checkbox, Container, CssBaseline, FormControl, FormControlLabel, FormGroup, FormLabel, Snackbar, TextField, Typography } from '@mui/material'
import { useState } from 'react'

export default function InquiryForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarSeverity, setSnackbarSeverity] = useState('')
  const [guestCount, setGuestCount] = useState('')
  const [entreeOptions, setEntreeOptions] = useState({
    asada: false,
    adobada: false,
    pollo: false,
    chorizo: false,
    lengua: false,
    tripas: false,
    veggie: false
  })
  const [drinkOptions, setDrinkOptions] = useState({
    horchata: false,
    infusedWater: false,
    bottledSoda: false,
    cannedSoda: false
  })
  
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

  const handleEntreeChange = (option) => {
    setEntreeOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
  }

  const handleDrinkChange = (option) => {
    setDrinkOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
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
              
              <TextField
                value={guestCount}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, '') // Only allow digits
                  setGuestCount(value)
                }}
                label="Guest Count (20-300)"
                variant="outlined"
                required
                fullWidth
                inputProps={{ min: 20, max: 300 }}
                helperText="Please enter number of guests (minimum 20, maximum 300)"
              />

              <FormControl component="fieldset" required>
                <FormLabel component="legend" sx={{ color: 'text.primary', mb: 1 }}>
                  Entree Options (select at least 2)
                </FormLabel>
                <FormGroup>
                  <FormControlLabel
                    control={<Checkbox checked={entreeOptions.asada} onChange={() => handleEntreeChange('asada')} />}
                    label="Asada"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={entreeOptions.adobada} onChange={() => handleEntreeChange('adobada')} />}
                    label="Adobada"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={entreeOptions.pollo} onChange={() => handleEntreeChange('pollo')} />}
                    label="Pollo (Chicken)"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={entreeOptions.chorizo} onChange={() => handleEntreeChange('chorizo')} />}
                    label="Chorizo"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={entreeOptions.lengua} onChange={() => handleEntreeChange('lengua')} />}
                    label="Lengua"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={entreeOptions.tripas} onChange={() => handleEntreeChange('tripas')} />}
                    label="Tripas"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={entreeOptions.veggie} onChange={() => handleEntreeChange('veggie')} />}
                    label="Veggie"
                  />
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
                  <FormControlLabel
                    control={<Checkbox checked={drinkOptions.cannedSoda} onChange={() => handleDrinkChange('cannedSoda')} />}
                    label="Canned Soda"
                  />
                </FormGroup>
              </FormControl>
              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                sx={{ mt: 2 }}
                disabled={status === 'Submitting...'}
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