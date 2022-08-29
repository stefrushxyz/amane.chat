export function rgbaToHex({ red, green, blue, alpha=255 }) {
  return '#' + [red, green, blue, alpha].map((val) => {
    const hexPart = val.toString(16)
    return [
      hexPart.length === 1 ? '0' : '',
      hexPart,
    ].join('')
  }).join('')
}

export function hexToRgba(hex) {
  if (hex.substring(0, 1) !== '#') {
    hex = `#${hex}`
  }

  const defaultRgba = { red: 0, green: 0, blue: 0, alpha: 255 }
  let redIdx, greenIdx, blueIdx, alphaIdx = null

  switch (hex.length) {
    case 5:
      alphaIdx = [4, 5]
    case 4:
      redIdx = [1, 2]
      greenIdx = [2, 3]
      blueIdx = [3, 4]
      break
    case 9:
      alphaIdx = [7, 9]
    case 7:
      redIdx = [1, 3]
      greenIdx = [3, 5]
      blueIdx = [5, 7]
      break
    default:
      return defaultRgba
  }

  function getRgbaPart(idx) {
    const hexPart = hex.substring(...idx)
    return Number.parseInt([
      hexPart,
      hexPart.length === 1 ? hexPart : '',
    ].join(''), 16)
  }

  const red = getRgbaPart(redIdx)
  const green = getRgbaPart(greenIdx)
  const blue = getRgbaPart(blueIdx)
  const alpha = alphaIdx !== null ? getRgbaPart(alphaIdx) : 255

  if ([red, green, blue, alpha].includes(NaN)) {
    return defaultRgba
  }

  return { red, green, blue, alpha }
}
