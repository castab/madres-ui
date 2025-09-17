function capitalizeFirstLetter(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return str // Handle empty strings or non-string inputs
  }
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default capitalizeFirstLetter
