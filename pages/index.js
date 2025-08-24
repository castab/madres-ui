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

// Custom theme based on Madres brand colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#7A6241', // Luna Brown
      light: '#9B7C5A',
      dark: '#5D4931',
    },
    secondary: {
      main: '#BB9D4C', // Sol Yellow
      light: '#D4B865',
      dark: '#A08439',
    },
    background: {
      default: '#FFF8F5', // Talavera White
      paper: '#DCD6CB', // Barrow Tan
    },
    text: {
      primary: '#7A6241', // Luna Brown
      secondary: '#BB9D4C', // Sol Yellow
    },
  },
  typography: {
    fontFamily: '"Futura PT Book", "Futura", "Century Gothic", "Arial", sans-serif',
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
    button: {
      fontFamily: '"Futura PT Demi", "Futura", "Century Gothic", "Arial", sans-serif',
      fontWeight: 600,
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
    background: 'rgba(122, 98, 65, 0.7)',
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
  background: 'rgba(255, 248, 245, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(122, 98, 65, 0.1)',
  borderBottom: `3px solid ${theme.palette.secondary.main}`,
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(122, 98, 65, 0.15)',
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component="img"
              src="./madres_color_text_only.png"
              alt="Madres Taco Shop Logo"
              sx={{ height: { xs: 40, md: 60 } }}
            />
          </Box>
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
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <Box
                component="img"
                src="./madres_color.png"
                alt="Madres Taco Shop Logo"
                sx={{ height: { xs: 240, md: 540 } }}
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
              <Button
                variant="outlined"
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
            <Grid item size={12}>
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
            <Grid item size={12}>
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
            <Grid item size={12}>
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
        color: 'primary.main' 
      }}>
        <Container maxWidth="md" textAlign="center">
          <Typography variant="h2" component="h2" gutterBottom color="primary.main">
            Ready to Taste Tradition?
          </Typography>
          <Typography variant="h5" component="p" sx={{ mb: 4, color: 'primary.main', opacity: 0.9 }}>
            Join thousands of satisfied customers who trust Madres Taco Shop for authentic Mexican cuisine.
          </Typography>
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
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, backgroundColor: 'primary.main', color: 'background.default' }}>
        <Container>
          <Grid container spacing={3} sx={{justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  component="img"
                  src="./madres_white_text_only.png"
                  alt="Madres Taco Shop Logo"
                  sx={{ height: { xs: 60 } }}
                />
              </Box>
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