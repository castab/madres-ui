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
  background: 'rgba(255, 248, 245, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(122, 98, 65, 0.1)',
  borderBottom: `3px solid ${theme.palette.secondary.main}`,
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
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
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8IS0tIFN1biBSYXlzIC0tPgo8cGF0aCBkPSJNNTAgMTBMMTMuNCAyMEw1MCAzMEw4Ni42IDIwTDUwIDEwWiIgZmlsbD0iI0JCOUI0QyIvPgo8cGF0aCBkPSJNMjAgMTMuNEwzMCA1MEwyMCA4Ni42TDEwIDUwTDIwIDEzLjRaIiBmaWxsPSIjQkI5RDRDIi8+CjxwYXRoIGQ9Ik04MCAzMC40TDkwIDUwTDgwIDg2LjZMNzAgNTBMODAgMTMuNFoiIGZpbGw9IiNCQjlENEMiLz4KPHBhdGggZD0iTTUwIDkwTDEzLjQgODBMNTAgNzBMODYuNiA4MEw1MCA5MFoiIGZpbGw9IiNCQjlENEMiLz4KPGV0Yy4uLj4KPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMTUiIGZpbGw9IiM3QTYyNDEiLz4KPC9zdmc+Cg=="
              alt="Madres Taco Shop Logo"
              sx={{ height: 40, width: 40 }}
            />
            <Typography 
              variant="h4" 
              component="div" 
              sx={{ 
                color: 'primary.main',
                fontWeight: 'bold',
                fontSize: { xs: '1.2rem', md: '1.5rem' }
              }}
            >
              MADRES TACO SHOP
            </Typography>
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
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjwhLS0gU3VuIFJheXMgLS0+CjxwYXRoIGQ9Ik0xMDAgMjBMMzAgNDBMMTAwIDYwTDE3MCA0MEwxMDAgMjBaIiBmaWxsPSIjQkI5RDRDIiBvcGFjaXR5PSIwLjkiLz4KPHA+cGF0aCBkPSJNNDAgMzBMNjAgMTAwTDQwIDE3MEwyMCAxMDBMNDAgMzBaIiBmaWxsPSIjQkI5RDRDIiBvcGFjaXR5PSIwLjkiLz4KPHA+cGF0aCBkPSJNMTYwIDMwTDE4MCAxMDBMMTYwIDE3MEwxNDAgMTAwTDE2MCAzMFoiIGZpbGw9IiNCQjlENEMiIG9wYWNpdHk9IjAuOSIvPgo8cGF0aCBkPSJNMTAwIDE4MEwzMCAxNjBMMTAwIDE0MEwxNzAgMTYwTDEwMCAxODBaIiBmaWxsPSIjQkI5RDRDIiBvcGFjaXR5PSIwLjkiLz4KPCEtLSBDZW50cmFsIFN1biAtLT4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIzMCIgZmlsbD0iIzdBNjI0MSIgb3BhY2l0eT0iMC45Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjN0E2MjQxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBvcGFjaXR5PSIwLjkiPk1hZHJlczwvdGV4dD4KPC9zdmc+"
                alt="Madres Taco Shop Logo"
                sx={{ height: { xs: 80, md: 120 }, width: { xs: 80, md: 120 } }}
              />
            </Box>
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '3rem', md: '5rem', lg: '6rem' },
                fontWeight: 'bold',
                mb: 1,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              MADRES
            </Typography>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                fontSize: { xs: '1.8rem', md: '3rem' },
                fontWeight: 'bold',
                mb: 3,
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              TACO SHOP
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
                  background: 'linear-gradient(45deg, #BB9D4C, #DCD6CB)',
                  color: '#7A6241',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #A08439, #BB9D4C)',
                    color: 'white',
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
                    borderColor: '#FFF8F5',
                    backgroundColor: 'rgba(255, 248, 245, 0.2)',
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
                  <Typography variant="h5" component="h3" gutterBottom color="secondary">
                    Fresh Daily
                  </Typography>
                  <Typography variant="body1" color="text.primary">
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
                  <Typography variant="h5" component="h3" gutterBottom color="secondary">
                    Family Recipes
                  </Typography>
                  <Typography variant="body1" color="text.primary">
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
                  <Typography variant="h5" component="h3" gutterBottom color="secondary">
                    Premium Catering
                  </Typography>
                  <Typography variant="body1" color="text.primary">
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
        background: 'linear-gradient(135deg, #BB9D4C, #DCD6CB)',
        color: 'primary.main' 
      }}>
        <Container maxWidth="md" textAlign="center">
          <Typography variant="h2" component="h2" gutterBottom color="primary.main">
            Ready to Taste Tradition?
          </Typography>
          <Typography variant="h5" component="p" sx={{ mb: 4, color: 'primary.main', opacity: 0.8 }}>
            Join thousands of satisfied customers who trust MADRES TACO SHOP for authentic Mexican cuisine.
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
            Order Online Now
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, backgroundColor: 'primary.main', color: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h3" gutterBottom>
                MADRES TACO SHOP
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