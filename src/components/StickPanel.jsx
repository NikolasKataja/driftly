import { getMagnitude } from '../logic/stickMath'

export function StickPanel({ title, x, y }) {
  const magnitude = getMagnitude(x, y)

  const dotX = 100 + x * 90
  const dotY = 100 + y * 90

  return (
    <div className="stick-panel">
      <h2>{title}</h2>

      <div className="stick-visual">
        <div className="center-dot" />
        <div
          className="stick-dot"
          style={{
            left: `${dotX}px`,
            top: `${dotY}px`,
          }}
        />
      </div>

      <div className="stick-values">
        <p>X: {x.toFixed(4)}</p>
        <p>Y: {y.toFixed(4)}</p>
        <p>Magnitude: {magnitude.toFixed(4)}</p>
      </div>
    </div>
  )
}