import React from 'react'
import { Box, Container, Grid, Typography } from '@mui/material'

const Footer = () => (
  <Box sx={{ py: 4, backgroundColor: 'primary.main', color: 'background.default' }}>
    <Container>
      <Grid
        container
        spacing={3}
        sx={{
          justifyContent: { xs: 'center', md: 'space-between' },
          alignItems: { xs: 'center', md: 'flex-start' },
          textAlign: { xs: 'center', md: 'left' },
        }}
      >
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="body2">
            Text: (555) 123-TACO<br />
            Email: inquire@madrestacoshop.com
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: { xs: 'center', md: 'flex-end' },
              gap: 2,
              mb: { xs: 2, md: 0 },
            }}
          >
            <Box
              component="img"
              src="./madres_white_text_only.png"
              alt="Madres Taco Shop Logo"
              sx={{ height: { xs: 80, md: 60 } }}
            />
          </Box>
          <Typography variant="body1">
            Serving authentic Mexican flavors with love and tradition since day one.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  </Box>
)

export default Footer