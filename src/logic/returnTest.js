import { getMagnitude, round } from './stickMath'

export const RETURN_TEST_STEPS = [
  { stick: 'leftStick', label: 'Left Stick', direction: 'up', axis: 'y', target: -1 },
  { stick: 'leftStick', label: 'Left Stick', direction: 'down', axis: 'y', target: 1 },
  { stick: 'leftStick', label: 'Left Stick', direction: 'left', axis: 'x', target: -1 },
  { stick: 'leftStick', label: 'Left Stick', direction: 'right', axis: 'x', target: 1 },

  { stick: 'rightStick', label: 'Right Stick', direction: 'up', axis: 'y', target: -1 },
  { stick: 'rightStick', label: 'Right Stick', direction: 'down', axis: 'y', target: 1 },
  { stick: 'rightStick', label: 'Right Stick', direction: 'left', axis: 'x', target: -1 },
  { stick: 'rightStick', label: 'Right Stick', direction: 'right', axis: 'x', target: 1 },
]

export const RETURN_TEST_PHASE = {
  IDLE: 'idle',
  WAITING_FOR_PUSH: 'waiting_for_push',
  WAITING_FOR_RELEASE: 'waiting_for_release',
  MEASURING_RETURN: 'measuring_return',
  COMPLETE: 'complete',
}

const PUSH_THRESHOLD = 0.7
const RELEASE_THRESHOLD = 0.25

export function hasReachedTargetDirection(stick, step) {
  const value = stick[step.axis]
  return step.target > 0 ? value >= PUSH_THRESHOLD : value <= -PUSH_THRESHOLD
}

export function hasReleasedToCenter(stick) {
  return getMagnitude(stick.x, stick.y) <= RELEASE_THRESHOLD
}

export function createReturnSample(stick) {
  return {
    x: stick.x,
    y: stick.y,
    magnitude: getMagnitude(stick.x, stick.y),
    timestamp: Date.now(),
  }
}

function average(values) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function analyzeReturnStep(step, samples) {
  const magnitudes = samples.map((sample) => sample.magnitude)

  return {
    stick: step.stick,
    label: step.label,
    direction: step.direction,
    averageReturnDrift: round(average(magnitudes)),
    peakReturnDrift: round(Math.max(...magnitudes, 0)),
    sampleCount: samples.length,
  }
}

export function summarizeReturnTest(stepResults) {
  const leftResults = stepResults.filter((result) => result.stick === 'leftStick')
  const rightResults = stepResults.filter((result) => result.stick === 'rightStick')

  return {
    leftStick: summarizeStickReturn(leftResults),
    rightStick: summarizeStickReturn(rightResults),
    steps: stepResults,
  }
}

function summarizeStickReturn(results) {
  const worst = results.reduce((currentWorst, result) => {
    if (!currentWorst) return result
    return result.peakReturnDrift > currentWorst.peakReturnDrift
      ? result
      : currentWorst
  }, null)

  const averageReturnDrift = average(results.map((result) => result.averageReturnDrift))
  const worstReturnDrift = worst?.peakReturnDrift ?? 0

  return {
    averageReturnDrift: round(averageReturnDrift),
    worstReturnDrift: round(worstReturnDrift),
    worstDirection: worst?.direction ?? 'unknown',
  }
}