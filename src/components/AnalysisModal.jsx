function getHealthClass(health) {
  return health.toLowerCase()
}

function getHealthDescription(health) {
  switch (health) {
    case 'Excellent':
      return 'Very stable. Drift is unlikely in most games.'
    case 'Good':
      return 'Healthy. A small deadzone should be enough.'
    case 'Warning':
      return 'Noticeable offset. Some games may drift without deadzone.'
    case 'Poor':
      return 'High drift risk. This stick may move by itself in games.'
    default:
      return 'No description available.'
  }
}

function ResultBlock({ title, data }) {
  const healthClass = getHealthClass(data.health)

  return (
    <div className="modal-result-block">
      <div className="modal-result-header">
        <h3>{title}</h3>
        <span className={`health-badge ${healthClass}`}>{data.health}</span>
      </div>

      <p className="health-description">{getHealthDescription(data.health)}</p>

      <div className="metric-list">
        <div className="metric-row">
          <span>Average drift</span>
          <strong>{data.averageDrift}</strong>
        </div>

        <div className="metric-row">
          <span>Peak drift</span>
          <strong>{data.peakDrift}</strong>
        </div>

        <div className="metric-row">
          <span>Jitter</span>
          <strong>{data.jitter}</strong>
        </div>

        <div className="metric-row highlight">
          <span>Recommended deadzone</span>
          <strong>{data.recommendedDeadzone}</strong>
        </div>
      </div>
    </div>
  )
}

export function AnalysisModal({ result, onClose }) {
  if (!result) return null

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2>Analysis Complete</h2>
            <p>Based on the controller resting still during measurement.</p>
          </div>

          <button className="modal-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-grid">
          <ResultBlock title="Left Stick" data={result.leftStick} />
          <ResultBlock title="Right Stick" data={result.rightStick} />
        </div>

        <div className="modal-footer">
          <p>
            Use the recommended deadzone as a starting point. Lower values feel
            more responsive, higher values reduce drift risk.
          </p>
        </div>
      </div>
    </div>
  )
}