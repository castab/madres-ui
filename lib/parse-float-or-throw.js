function parseToFloatOrThrow(value) {
  const floatValue = parseFloat(value)

  // Check if the result of parseFloat is NaN
  if (isNaN(floatValue)) {
    throw new Error(`Invalid input: '${value}' cannot be converted to a float.`)
  }

  return floatValue
}

export default parseToFloatOrThrow