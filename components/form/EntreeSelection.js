import { Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel } from '@mui/material'
import { useEffect, useState } from 'react'

export default function EntreeSelection({selectedEntrees, onSelectionChange}) {
  const [entreeOptions, setEntreeOptions] = useState([])
  const [selectionCountError, setSelectionCountError] = useState(false)
  
  useEffect(() => {
    fetch('/api/options/entree')
      .then(res => res.json())
      .then(data => setEntreeOptions(data))
      .catch(error => console.error('Failed to fetch entree options:', error));
  }, [])
  
  const handleCheckboxChange = (entreeName) => {
    const newSelected = selectedEntrees.includes(entreeName)
      ? selectedEntrees.filter(name => name !== entreeName)
      : [...selectedEntrees, entreeName];
  
    onSelectionChange(newSelected);
    setSelectionCountError(newSelected.length < 2);
  };
    
  return (
    <FormControl>
      <FormLabel component="legend" sx={{ color: 'text.primary', mb: 1 }}>
        Entree Options (select at least 2)
      </FormLabel>
      <FormGroup>
        {entreeOptions.map(entreeOption => (
          <FormControlLabel
            key={entreeOption.name}
            control={
              <Checkbox 
                name={entreeOption.display}
                checked={selectedEntrees.includes(entreeOption.name)}
                onChange={() => handleCheckboxChange(entreeOption.name)}
              />
            }
            label={entreeOption.display}
          />
        ))}
        {selectionCountError && <FormHelperText>Gotta pick at least 2!</FormHelperText>}
      </FormGroup>
    </FormControl>
  )
}