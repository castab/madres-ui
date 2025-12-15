import { TextField } from "@mui/material";

export default function Honeypot({honeypotValue, onHoneypotChange}) {
    return <TextField
    value={honeypotValue}
    onChange={e => onHoneypotChange(e.target.value)}
    label="Company Name"
    name="company"
    variant="outlined"
    aria-hidden
    sx={{
      position: 'absolute',
      left: '-9999px',
      visibility: 'hidden',
      opacity: 0,
      height: 0,
      width: 0,
      overflow: 'hidden',
      tabIndex: -1,
    }}
    tabIndex={-1}
    autoComplete="off"
  />
}