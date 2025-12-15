import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel } from '@mui/material'
import { useEffect, useState } from 'react'

export default function BeverageSelection({selectedBeverages, onSelectionChange}) {
  const [beverageOptions, setBeverageOptions] = useState([])
  
  useEffect(() => {
    fetch('/api/options/beverage')
      .then(res => res.json())
      .then(data => setBeverageOptions(data))
      .catch(error => console.error('Failed to fetch beverage options:', error));
  }, [])
  
  const handleCheckboxChange = (beverageName) => {
    const newSelected = selectedBeverages.includes(beverageName)
      ? selectedBeverages.filter(name => name !== beverageName)
      : [...selectedBeverages, beverageName];
    
    onSelectionChange(newSelected);
  };
    
  return (
    <FormControl>
      <FormLabel component="legend" sx={{ color: 'text.primary', mb: 1 }}>
        Drink Options (optional)
      </FormLabel>
      <FormGroup>
        {beverageOptions.map(beverageOption => (
          <FormControlLabel
            key={beverageOption.name}
            control={
              <Checkbox 
                name={beverageOption.display}
                checked={selectedBeverages.includes(beverageOption.name)}
                onChange={() => handleCheckboxChange(beverageOption.name)}
              />
            }
            label={beverageOption.display}
          />
        ))}
      </FormGroup>
    </FormControl>
  )
}