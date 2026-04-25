export function ReturnTestPanel({
  phase,
  currentStep,
  currentStepIndex,
  totalSteps,
  secondsLeft,
  result,
  onStart,
}) {
  const isRunning = phase !== 'idle' && phase !== 'complete'

  return (
    <section className="return-test-card">
      <div>
        <h2>Return-to-center test</h2>
        <p>
          Move each stick in the requested direction, release it, and Driftly
          will measure how well it returns to center.
        </p>
      </div>

      {!isRunning && (
        <button onClick={onStart}>
          {result ? 'Run Again' : 'Start Return Test'}
        </button>
      )}

      {isRunning && currentStep && (
        <div className="return-test-status">
          <span>
            Step {currentStepIndex + 1}/{totalSteps}
          </span>

          <strong>
            {currentStep.label}: push {currentStep.direction.toUpperCase()} and release
          </strong>

          <p>{getPhaseText(phase, secondsLeft)}</p>
        </div>
      )}

      {result && !isRunning && (
        <div className="return-summary">
          <div>
            <span>Left worst return</span>
            <strong>{result.leftStick.worstReturnDrift}</strong>
            <small>Worst direction: {result.leftStick.worstDirection}</small>
          </div>

          <div>
            <span>Right worst return</span>
            <strong>{result.rightStick.worstReturnDrift}</strong>
            <small>Worst direction: {result.rightStick.worstDirection}</small>
          </div>
        </div>
      )}
    </section>
  )
}

function getPhaseText(phase, secondsLeft) {
  if (phase === 'waiting_for_push') return 'Push the stick fully in that direction.'
  if (phase === 'waiting_for_release') return 'Good. Now release the stick.'
  if (phase === 'measuring_return') return `Measuring return... ${secondsLeft}s`
  return ''
}