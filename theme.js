import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#7A6241',
      light: '#9B7C5A',
      dark: '#5D4931',
    },
    secondary: {
      main: '#BB9D4C',
      light: '#D4B865',
      dark: '#A08439',
    },
    background: {
      default: '#FFF8F5',
      paper: '#DCD6CB',
    },
    text: {
      primary: '#7A6241',
      secondary: '#BB9D4C',
    },
  },
  typography: {
    fontFamily: '"Futura PT Book", "Futura", "Century Gothic", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 },
    button: {
      fontFamily: '"Futura PT Demi", "Futura", "Century Gothic", "Arial", sans-serif',
      fontWeight: 600,
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF', // Using white for better contrast
            '& fieldset': {
              borderColor: '#7A6241', // primary.main
            },
            '&:hover fieldset': {
              borderColor: '#5D4931', // primary.dark
            },
            '&.Mui-focused fieldset': {
              borderColor: '#7A6241', // primary.main
            },
          },
        },
      },
    },
  },
})

export default theme
