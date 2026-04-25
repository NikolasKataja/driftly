import { useEffect, useRef, useState } from 'react'
import './App.css'

import { useGamepad } from './hooks/useGamepad'
import { createStickSample, analyzeDriftSession } from './logic/driftAnalysis'
import { StickPanel } from './components/StickPanel'
import { AnalysisControls } from './components/AnalysisControls'
import { AnalysisModal } from './components/AnalysisModal'

const ANALYSIS_DURATION_MS = 10000

export default function App() {
  const { controller, leftStick, rightStick } = useGamepad()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const samplesRef = useRef({
    leftStick: [],
    rightStick: [],
  })

  const analysisStartTimeRef = useRef(null)

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

          <AnalysisModal
            result={showModal ? analysisResult : null}
            onClose={() => setShowModal(false)}
          />
        </>
      )}
    </main>
  )
}