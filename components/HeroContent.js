import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

const HeroContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  color: 'white',
  textAlign: 'center',
}))

export default HeroContent
