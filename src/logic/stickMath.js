export function getMagnitude(x, y) {
  return Math.sqrt(x * x + y * y);
}

export function round(value, decimals = 4) {
    return Number(value.toFixed(decimals));
}

export function getStickSample(x, y) {
    return {
        x,
        y,
        magnitude: getMagnitude(x, y),
        timestamp: Date.now(),
    }
}