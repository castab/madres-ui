import { React, useState, useEffect } from 'react'
import { AppBar, Toolbar, Box, Button, Drawer, Typography, IconButton, List, ListItemButton, useMediaQuery } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import MenuIcon from '@mui/icons-material/Menu'

const FloatingNav = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 248, 245, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(122, 98, 65, 0.1)',
  borderBottom: `3px solid ${theme.palette.secondary.main}`,
}))

const Header = () => {
  const navItems = ['Menu', 'Catering', 'Gallery', 'About', 'Inquire']
  const [drawerOpen, setDrawerOpen] = useState(false)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(false)
    }
  }, [isMobile])

  return <FloatingNav position="fixed" elevation={0}>
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
      <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
        <IconButton
          aria-label="open menu"
          onClick={() => setDrawerOpen(true)}
          sx={{ color: 'primary.main' }}
        >
          <MenuIcon />
        </IconButton>
      </Box>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={{ width: 260, p: 2 }}
          role="presentation"
          onClick={() => setDrawerOpen(false)}
          onKeyDown={() => setDrawerOpen(false)}
        >
          <List>
            {navItems.map((text) => (
              <ListItemButton key={text}>
                <Typography variant="button">
                  {text}
                </Typography>
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

    </Toolbar>
  </FloatingNav>
}

export default Header
