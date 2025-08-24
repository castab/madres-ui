import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Custom theme based on traditional Mexican/taco shop colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#D32F2F', // Deep red
      light: '#FF6659',
      dark: '#9A0007',
    },
    secondary: {
      main: '#FF9800', // Orange/amber
      light: '#FFB74D',
      dark: '#F57C00',
    },
    background: {
      default: '#FFF8E1', // Cream/warm white
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2E2E2E',
      secondary: '#5D4037', // Brown
    },
  },
  typography: {
    fontFamily: '"Futura PT", "Futura", "Century Gothic", "Arial", sans-serif',
    h1: {
      fontFamily: '"Futura PT Demi", "Futura", "Century Gothic", "Arial", sans-serif',
      fontWeight: 600,
    },
    h2: {
      fontFamily: '"Futura PT Demi", "Futura", "Century Gothic", "Arial", sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Futura PT Demi", "Futura", "Century Gothic", "Arial", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Futura PT Demi", "Futura", "Century Gothic", "Arial", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Futura PT Demi", "Futura", "Century Gothic", "Arial", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Futura PT Demi", "Futura", "Century Gothic", "Arial", sans-serif',
      fontWeight: 600,
    },
    body1: {
      fontFamily: '"Futura PT Book", "Futura", "Century Gothic", "Arial", sans-serif',
      fontWeight: 400,
    },
    body2: {
      fontFamily: '"Futura PT Book", "Futura", "Century Gothic", "Arial", sans-serif',
      fontWeight: 400,
    },
  },
});

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  backgroundImage: 'url("https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(211, 47, 47, 0.7), rgba(255, 152, 0, 0.3))',
    zIndex: 1,
  },
}));

const HeroContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  color: 'white',
  textAlign: 'center',
}));

const FloatingNav = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  borderBottom: `3px solid ${theme.palette.primary.main}`,
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(211, 47, 47, 0.15)',
  },
}));

const MadresLandingPage = () => {
  const navItems = ['Menu', 'Catering', 'About', 'Locations', 'Contact'];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Floating Navigation */}
      <FloatingNav position="fixed" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              color: 'primary.main',
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', md: '2rem' }
            }}
          >
            MADRES
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item}
                sx={{
                  color: 'text.primary',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                  },
                }}
              >
                {item}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </FloatingNav>

      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <HeroContent>
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '3rem', md: '5rem', lg: '6rem' },
                fontWeight: 'bold',
                mb: 2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              MADRES
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                fontSize: { xs: '1.5rem', md: '2.5rem' },
                mb: 3,
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              Authentic Mexican Flavors
            </Typography>
            <Typography 
              variant="h5" 
              component="p" 
              sx={{ 
                fontSize: { xs: '1rem', md: '1.25rem' },
                mb: 4,
                maxWidth: '600px',
                margin: '0 auto 2rem auto',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              Experience the taste of tradition with our handcrafted tacos, 
              made fresh daily with love and the finest ingredients.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #D32F2F, #FF6659)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #9A0007, #D32F2F)',
                  },
                }}
              >
                Order Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderColor: 'white',
                  color: 'white',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            component="h2" 
            textAlign="center" 
            sx={{ mb: 6, color: 'text.primary' }}
          >
            Why Choose Madres?
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <FeatureCard>
                <CardMedia
                  component="img"
                  height="200"
                  image="https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Fresh ingredients"
                />
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom color="primary">
                    Fresh Daily
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    All our ingredients are sourced fresh daily, ensuring every bite 
                    is packed with authentic flavors and the highest quality.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard>
                <CardMedia
                  component="img"
                  height="200"
                  image="https://images.unsplash.com/photo-1613514785940-daed07799d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Traditional recipes"
                />
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom color="primary">
                    Family Recipes
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Passed down through generations, our traditional recipes bring 
                    you the authentic taste of Mexico in every dish.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard>
                <CardMedia
                  component="img"
                  height="200"
                  image="https://images.unsplash.com/photo-1559847844-d7b33d2e7da0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Catering service"
                />
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom color="primary">
                    Premium Catering
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
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
        backgroundColor: 'primary.main',
        background: 'linear-gradient(135deg, #D32F2F, #FF9800)',
        color: 'white' 
      }}>
        <Container maxWidth="md" textAlign="center">
          <Typography variant="h2" component="h2" gutterBottom>
            Ready to Taste Tradition?
          </Typography>
          <Typography variant="h5" component="p" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of satisfied customers who trust Madres for authentic Mexican cuisine.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'background.default',
              },
            }}
          >
            Order Online Now
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, backgroundColor: 'text.primary', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h3" gutterBottom>
                MADRES
              </Typography>
              <Typography variant="body1">
                Serving authentic Mexican flavors with love and tradition since day one.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h6" gutterBottom>
                Contact Us
              </Typography>
              <Typography variant="body2">
                Phone: (555) 123-TACO<br />
                Email: hello@madrestacoshop.com
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default MadresLandingPage;