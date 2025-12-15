import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel } from '@mui/material'
import { useEffect, useState } from 'react'

export default function AppetizerSelection({selectedAppetizers, onSelectionChange}) {
  const [appetizerOptions, setAppetizerOptions] = useState([])
  
  useEffect(() => {
    fetch('/api/options/appetizer')
      .then(res => res.json())
      .then(data => setAppetizerOptions(data))
      .catch(error => console.error('Failed to fetch appetizer options:', error))
  }, [])
  
  const handleCheckboxChange = (appetizerName) => {
    const newSelected = selectedAppetizers.includes(appetizerName)
      ? selectedAppetizers.filter(name => name !== appetizerName)
      : [...selectedAppetizers, appetizerName]
    onSelectionChange(newSelected)
  }
    
  return (
    <FormControl>
      <FormLabel component="legend" sx={{ color: 'text.primary', mb: 1 }}>
        Appetizer Options (optional)
      </FormLabel>
      <FormGroup>
        {appetizerOptions.map(appetizerOption => (
          <FormControlLabel
            key={appetizerOption.name}
            control={
              <Checkbox 
                name={appetizerOption.display}
                checked={selectedAppetizers.includes(appetizerOption.name)}
                onChange={() => handleCheckboxChange(appetizerOption.name)}
              />
            }
            label={appetizerOption.display}
          />
        ))}
      </FormGroup>
    </FormControl>
  )
}