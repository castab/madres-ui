import React, { useState, useEffect, useCallback } from 'react'
import {
  Typography,
  Button,
  Box,
  Container,
  Grid,
  CardContent,
  CardMedia,
  ThemeProvider,
  CssBaseline,
  Snackbar, 
  Alert,
  Slide,
} from '@mui/material'
import theme from '@/theme'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import HeroContent from '@/components/HeroContent'
import FeatureCard from '@/components/FeatureCard'
import Link from 'next/link'

const MadresLandingPage = () => {
  const [open, setOpen] = useState(false)
  const [snackbarKey, setSnackbarKey] = useState(Date.now())

  const handleClick = useCallback(() => {
    if (open) {
      setSnackbarKey(Date.now()) // refresh timer
    } else {
      setOpen(true)
    }
  }, [open])

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return
    setOpen(false)
  }

  useEffect(() => {
    const elements = document.querySelectorAll('a, button')
    const handleEvent = (e) => {
      const target = e.currentTarget
      if (target.dataset.wip === 'true') {
        e.preventDefault()
        handleClick()
      }
    }
    elements.forEach((el) => el.addEventListener('click', handleEvent))
    return () => {
      elements.forEach((el) => el.removeEventListener('click', handleEvent))
    }
  }, [handleClick])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />

      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <HeroContent>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <Box
                component="img"
                src="./madres_color.png"
                alt="Madres Taco Shop Logo"
                sx={{ height: { xs: 260, sm: 300 } }}
              />
            </Box>
            <Typography 
              variant="h5" 
              component="p" 
              sx={{ 
                fontSize: { xs: '1rem', md: '1.25rem' },
                mb: 4,
                maxWidth: '600px',
                margin: '0 auto 2rem auto',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              Experience the taste of tradition with our handcrafted tacos, 
              made fresh daily with love and the finest ingredients.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/inquire" passHref>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    backgroundColor: 'secondary.main',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'secondary.dark',
                      color: 'background.default',
                    },
                  }}
                >
                Inquire Now
                </Button>
              </Link>
              <Button
                data-wip="true"
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderColor: 'background.paper',
                  color: 'background.paper',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: 'background.default',
                    backgroundColor: 'background.paper',
                    color: 'primary.main',
                  },
                }}
              >
                View Menu
              </Button>
            </Box>
          </HeroContent>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container>
          <Typography 
            variant="h2" 
            component="h2" 
            textAlign="center" 
            sx={{ mb: 6, color: 'text.primary' }}
          >
            Why choose Madres?
          </Typography>
          <Grid container spacing={4} >
            <Grid size={12}>
              <FeatureCard>
                <CardMedia
                  component="img"
                  sx={{ height: 200, objectFit: 'cover' }}
                  image="https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Fresh ingredients"
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h5" component="h3" gutterBottom color="secondary">
                    Fresh Daily
                  </Typography>
                  <Typography variant="body1" color="text.primary" sx={{ flexGrow: 1 }}>
                    All our ingredients are sourced fresh daily, ensuring every bite 
                    is packed with authentic flavors and the highest quality.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid size={12}>
              <FeatureCard>
                <CardMedia
                  component="img"
                  height="200"
                  image="https://images.unsplash.com/photo-1613514785940-daed07799d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Traditional recipes"
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h5" component="h3" gutterBottom color="secondary">
                    Family Recipes
                  </Typography>
                  <Typography variant="body1" color="text.primary" sx={{ flexGrow: 1 }}>
                    Passed down through generations, our traditional recipes bring 
                    you the authentic taste of Mexico in every dish.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid size={12}>
              <FeatureCard>
                <CardMedia
                  component="img"
                  height="200"
                  image="./tacos-lined.jpg"
                  alt="Catering service"
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h5" component="h3" gutterBottom color="secondary">
                    Premium Catering
                  </Typography>
                  <Typography variant="body1" color="text.primary" sx={{ flexGrow: 1 }}>
                    Elevate your events with our professional catering services, 
                    bringing restaurant-quality Mexican cuisine to your special occasions.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box sx={{ 
        py: 8, 
        backgroundColor: 'secondary.main',
        color: 'primary.main', 
      }}>
        <Container maxWidth="md" textAlign="center">
          <Typography variant="h2" component="h2" gutterBottom color="primary.main">
            Ready to Taste Tradition?
          </Typography>
          <Typography variant="h5" component="p" sx={{ mb: 4, color: 'primary.main', opacity: 0.9 }}>
            Join thousands of satisfied customers who trust Madres Taco Shop for authentic Mexican cuisine.
          </Typography>
          <Link href="/inquire">
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                backgroundColor: 'primary.main',
                color: 'background.default',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
            Inquire Online Now
            </Button>
          </Link>
        </Container>
      </Box>

      <Footer />

      {/* Snackbar Notification */}
      <Snackbar
        key={snackbarKey}
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slots={{ transition: Slide }}
      >
        <Alert
          onClose={handleClose}
          severity="info"
          sx={{ width: '100%', backgroundColor: '#BB9D4C', color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}
          icon={false}
        >
          🛠️ Pardon our dust! Buttons and links on this page are still under construction.
        </Alert>
      </Snackbar>
    </ThemeProvider>
  )
}

export default MadresLandingPage