import { getMagnitude, round } from './stickMath'

const SAFETY_MARGIN = 0.015

function average(values) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function getHealthStatus(recommendedDeadzone) {
  if (recommendedDeadzone < 0.03) return 'Excellent'
  if (recommendedDeadzone < 0.05) return 'Good'
  if (recommendedDeadzone < 0.08) return 'Warning'
  return 'Poor'
}

function analyzeStick(samples) {
  const magnitudes = samples.map((sample) => sample.magnitude)

  const averageDrift = average(magnitudes)
  const peakDrift = Math.max(...magnitudes, 0)
  const minDrift = Math.min(...magnitudes)
  const jitter = peakDrift - minDrift

  const recommendedDeadzone = Math.min(
    0.25,
    peakDrift + jitter + SAFETY_MARGIN
  )

  return {
    averageDrift: round(averageDrift),
    peakDrift: round(peakDrift),
    jitter: round(jitter),
    recommendedDeadzone: round(recommendedDeadzone, 3),
    health: getHealthStatus(recommendedDeadzone),
  }
}

export function analyzeDriftSession(samples) {
  return {
    leftStick: analyzeStick(samples.leftStick),
    rightStick: analyzeStick(samples.rightStick),
  }
}

export function createStickSample(stick) {
  return {
    x: stick.x,
    y: stick.y,
    magnitude: getMagnitude(stick.x, stick.y),
    timestamp: Date.now(),
  }
}