export function AnalysisResultCard({ title, result }) {
  if (!result) return null

  return (
    <div className="result-card">
      <h3>{title}</h3>

      <p>
        <strong>Health:</strong> {result.health}
      </p>
      <p>
        <strong>Average drift:</strong> {result.averageDrift}
      </p>
      <p>
        <strong>Peak drift:</strong> {result.peakDrift}
      </p>
      <p>
        <strong>Jitter:</strong> {result.jitter}
      </p>
      <p>
        <strong>Recommended deadzone:</strong> {result.recommendedDeadzone}
      </p>
    </div>
  )
}