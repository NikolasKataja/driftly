import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

import { useGamepad } from './hooks/useGamepad'
import { createStickSample, analyzeDriftSession } from './logic/driftAnalysis'
import {
  RETURN_TEST_PHASE,
  RETURN_TEST_STEPS,
  analyzeReturnStep,
  createReturnSample,
  hasReachedTargetDirection,
  hasReleasedToCenter,
  summarizeReturnTest,
} from './logic/returnTest'

import { StickPanel } from './components/StickPanel'
import { AnalysisControls } from './components/AnalysisControls'
import { AnalysisModal } from './components/AnalysisModal'
import { ReturnTestPanel } from './components/ReturnTestPanel'

const ANALYSIS_DURATION_MS = 10000
const RETURN_MEASURE_MS = 700

export default function App() {
  const { controller, leftStick, rightStick } = useGamepad()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const [returnPhase, setReturnPhase] = useState(RETURN_TEST_PHASE.IDLE)
  const [returnStepIndex, setReturnStepIndex] = useState(0)
  const [returnSecondsLeft, setReturnSecondsLeft] = useState(0)
  const [returnResult, setReturnResult] = useState(null)

  const samplesRef = useRef({
    leftStick: [],
    rightStick: [],
  })

  const analysisStartTimeRef = useRef(null)

  const returnStepIndexRef = useRef(0)
  const returnStepSamplesRef = useRef([])
  const returnStepResultsRef = useRef([])
  const returnMeasureStartRef = useRef(null)
  const returnPhaseLockRef = useRef(null)

  const sticks = useMemo(
    () => ({
      leftStick,
      rightStick,
    }),
    [leftStick, rightStick]
  )

  function startAnalysis() {
    samplesRef.current = {
      leftStick: [],
      rightStick: [],
    }

    setAnalysisResult(null)
    setShowModal(false)
    setIsAnalyzing(true)
    setSecondsLeft(Math.ceil(ANALYSIS_DURATION_MS / 1000))
    analysisStartTimeRef.current = Date.now()
  }

  function startReturnTest() {
    returnStepIndexRef.current = 0
    returnStepSamplesRef.current = []
    returnStepResultsRef.current = []
    returnMeasureStartRef.current = null
    returnPhaseLockRef.current = null

    setReturnResult(null)
    setReturnStepIndex(0)
    setReturnSecondsLeft(0)
    setReturnPhase(RETURN_TEST_PHASE.WAITING_FOR_PUSH)
  }

  function completeCurrentReturnStep(step) {
    const stepResult = analyzeReturnStep(step, returnStepSamplesRef.current)
    returnStepResultsRef.current.push(stepResult)

    const nextIndex = returnStepIndexRef.current + 1

    returnStepSamplesRef.current = []
    returnMeasureStartRef.current = null
    returnPhaseLockRef.current = null

    if (nextIndex >= RETURN_TEST_STEPS.length) {
      const summary = summarizeReturnTest(returnStepResultsRef.current)
      setReturnResult(summary)
      setReturnPhase(RETURN_TEST_PHASE.COMPLETE)
      return
    }

    returnStepIndexRef.current = nextIndex
    setReturnStepIndex(nextIndex)
    setReturnPhase(RETURN_TEST_PHASE.WAITING_FOR_PUSH)
  }

  useEffect(() => {
    if (!isAnalyzing) return

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - analysisStartTimeRef.current
      const remaining = Math.max(0, ANALYSIS_DURATION_MS - elapsed)

      samplesRef.current.leftStick.push(createStickSample(leftStick))
      samplesRef.current.rightStick.push(createStickSample(rightStick))

      setSecondsLeft(Math.ceil(remaining / 1000))

      if (remaining <= 0) {
        clearInterval(intervalId)

        const result = analyzeDriftSession(samplesRef.current)

        setAnalysisResult(result)
        setShowModal(true)
        setIsAnalyzing(false)
      }
    }, 16)

    return () => clearInterval(intervalId)
  }, [isAnalyzing, leftStick, rightStick])

  useEffect(() => {
    if (
      returnPhase === RETURN_TEST_PHASE.IDLE ||
      returnPhase === RETURN_TEST_PHASE.COMPLETE
    ) {
      return
    }

    const frameId = requestAnimationFrame(() => {
      const step = RETURN_TEST_STEPS[returnStepIndexRef.current]
      const stick = sticks[step.stick]

      if (returnPhase === RETURN_TEST_PHASE.WAITING_FOR_PUSH) {
        if (
          hasReachedTargetDirection(stick, step) &&
          returnPhaseLockRef.current !== RETURN_TEST_PHASE.WAITING_FOR_RELEASE
        ) {
          returnPhaseLockRef.current = RETURN_TEST_PHASE.WAITING_FOR_RELEASE
          setReturnPhase(RETURN_TEST_PHASE.WAITING_FOR_RELEASE)
        }

        return
      }

      if (returnPhase === RETURN_TEST_PHASE.WAITING_FOR_RELEASE) {
        if (
          hasReleasedToCenter(stick) &&
          returnPhaseLockRef.current !== RETURN_TEST_PHASE.MEASURING_RETURN
        ) {
          returnStepSamplesRef.current = []
          returnMeasureStartRef.current = Date.now()
          returnPhaseLockRef.current = RETURN_TEST_PHASE.MEASURING_RETURN

          setReturnSecondsLeft(Math.ceil(RETURN_MEASURE_MS / 1000))
          setReturnPhase(RETURN_TEST_PHASE.MEASURING_RETURN)
        }

        return
      }

      if (returnPhase === RETURN_TEST_PHASE.MEASURING_RETURN) {
        returnStepSamplesRef.current.push(createReturnSample(stick))

        const elapsed = Date.now() - returnMeasureStartRef.current
        const remaining = Math.max(0, RETURN_MEASURE_MS - elapsed)

        setReturnSecondsLeft(Math.ceil(remaining / 1000))

        if (remaining <= 0) {
          completeCurrentReturnStep(step)
        }
      }
    })

    return () => cancelAnimationFrame(frameId)
  }, [returnPhase, sticks])

  const currentReturnStep = RETURN_TEST_STEPS[returnStepIndex]

  return (
    <main className="app">
      <header className="header">
        <h1>Driftly</h1>
        <p>Simple controller stick diagnostics for macOS.</p>
      </header>

      {!controller ? (
        <section className="empty-state">
          <h2>No controller detected</h2>
          <p>Connect your controller with USB-C and press any button.</p>
        </section>
      ) : (
        <>
          <section className="controller-card">
            <p>
              <strong>Controller:</strong> {controller.id}
            </p>
            <p>
              <strong>Axes:</strong> {controller.axesCount}
            </p>
            <p>
              <strong>Buttons:</strong> {controller.buttonCount}
            </p>
          </section>

          <section className="stick-grid">
            <StickPanel title="Left Stick" x={leftStick.x} y={leftStick.y} />
            <StickPanel title="Right Stick" x={rightStick.x} y={rightStick.y} />
          </section>

          <AnalysisControls
            isAnalyzing={isAnalyzing}
            secondsLeft={secondsLeft}
            onStart={startAnalysis}
          />

          <ReturnTestPanel
            phase={returnPhase}
            currentStep={currentReturnStep}
            currentStepIndex={returnStepIndex}
            totalSteps={RETURN_TEST_STEPS.length}
            secondsLeft={returnSecondsLeft}
            result={returnResult}
            onStart={startReturnTest}
          />

          <AnalysisModal
            result={showModal ? analysisResult : null}
            onClose={() => setShowModal(false)}
          />
        </>
      )}
    </main>
  )
}