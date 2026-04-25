export function AnalysisControls({ isAnalyzing, secondsLeft, onStart }) {
  return (
    <section className="analysis-controls">
      <div>
        <h2>Stick Health Analysis</h2>
        <p>
          Keep the controller still while measuring.
        </p>
      </div>

      <button disabled={isAnalyzing} onClick={onStart}>
        {isAnalyzing ? `Analyzing... ${secondsLeft}s` : 'Start Analysis'}
      </button>
    </section>
  )
}